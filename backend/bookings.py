from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from redis_store import client as redis_client
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

@router.post("/lock")
def lock_seat(req: schemas.SeatLockRequest, db: Session = Depends(get_db)):
    key = f"locked_seat:{req.bus_id}:{req.travel_date}:{req.seat_id}"
    
    # Check if already booked
    is_booked = db.query(models.Booking).filter(
        models.Booking.bus_id == req.bus_id,
        models.Booking.seat_id == req.seat_id,
        models.Booking.travel_date == req.travel_date,
        models.Booking.status == "booked"
    ).first()
    
    if is_booked:
        raise HTTPException(status_code=400, detail="Seat is already booked permanently.")
    
    # Check if locked by someone else
    locked_by = redis_client.get(key)
    if locked_by:
        raise HTTPException(status_code=400, detail="Seat is currently locked by another user.")
        
    # Lock for 5 minutes (300 seconds)
    # Using a dummy user_id for lock since we haven't strictly depend on auth user ID here, 
    # but in real app we would use current_user.id
    redis_client.setex(key, 300, "locked_temporarily")
    return {"message": "Seat locked successfully for 5 minutes."}

@router.post("/confirm")
def confirm_booking(req: schemas.BookingRequest, user_id: int = 1, db: Session = Depends(get_db)):
    # In real app, user_id comes from Depends(get_current_user)
    key = f"locked_seat:{req.bus_id}:{req.travel_date}:{req.seat_id}"
    
    # Check if booked
    is_booked = db.query(models.Booking).filter(
        models.Booking.bus_id == req.bus_id,
        models.Booking.seat_id == req.seat_id,
        models.Booking.travel_date == req.travel_date,
        models.Booking.status == "booked"
    ).first()
    
    if is_booked:
        raise HTTPException(status_code=400, detail="Seat already booked.")
        
    # Create booking
    booking = models.Booking(
        user_id=user_id,
        bus_id=req.bus_id,
        seat_id=req.seat_id,
        travel_date=req.travel_date,
        gender=req.gender,
        status="booked",
        payment_status="success",
        amount=req.amount
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # Remove lock
    redis_client.delete(key)
    
    return {"message": "Booking confirmed successfully", "booking_id": booking.id}

@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking or booking.status != "booked":
        raise HTTPException(status_code=400, detail="Invalid booking")
        
    booking.status = "cancelled"
    db.commit()
    
    # Auto-assign from waitlist
    waitlist_user = db.query(models.WaitingList).filter(
        models.WaitingList.bus_id == booking.bus_id,
        models.WaitingList.travel_date == booking.travel_date,
        models.WaitingList.status == "waiting"
    ).order_by(models.WaitingList.position.asc()).first()
    
    assigned_to_waitlist = False
    if waitlist_user:
        bus = db.query(models.Bus).filter(models.Bus.id == booking.bus_id).first()
        assigned_seat_price = waitlist_user.amount_paid
        if bus:
            assigned_seat_price = bus.base_price_upper if booking.seat_id.startswith('U') else bus.base_price_lower
        
        refund_amount = 0.0
        if assigned_seat_price < waitlist_user.amount_paid:
            refund_amount = waitlist_user.amount_paid - assigned_seat_price

        # Create new booking for waitlist user
        new_booking = models.Booking(
            user_id=waitlist_user.user_id,
            bus_id=booking.bus_id,
            seat_id=booking.seat_id,
            travel_date=booking.travel_date,
            gender=waitlist_user.gender,
            status="booked",
            payment_status="success",
            amount=assigned_seat_price
        )
        db.add(new_booking)
        waitlist_user.status = "confirmed"
        waitlist_user.amount_paid = assigned_seat_price # Update this so we know what was actually charged
        db.commit()
        assigned_to_waitlist = True

        # Shift other waitlist users up
        other_users = db.query(models.WaitingList).filter(
            models.WaitingList.bus_id == booking.bus_id,
            models.WaitingList.travel_date == booking.travel_date,
            models.WaitingList.status == "waiting"
        ).all()
        for u in other_users:
            u.position -= 1
        db.commit()
        
    return {"message": "Booking cancelled", "auto_assigned": assigned_to_waitlist}

@router.post("/waitlist")
def join_waitlist(req: schemas.BookingRequest, user_id: int = 1, db: Session = Depends(get_db)):
    existing = db.query(models.WaitingList).filter(
        models.WaitingList.bus_id == req.bus_id,
        models.WaitingList.travel_date == req.travel_date,
        models.WaitingList.user_id == user_id,
        models.WaitingList.status == "waiting"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You are already in the waiting list.")
        
    waitlist_count = db.query(models.WaitingList).filter(
        models.WaitingList.bus_id == req.bus_id,
        models.WaitingList.travel_date == req.travel_date,
        models.WaitingList.status == "waiting"
    ).count()
    
    if waitlist_count >= 2:
        raise HTTPException(status_code=400, detail="Waitlist is full (max 2).")
        
    wl_entry = models.WaitingList(
        user_id=user_id,
        bus_id=req.bus_id,
        position=waitlist_count + 1,
        status="waiting",
        travel_date=req.travel_date,
        gender=req.gender,
        amount_paid=req.amount
    )
    db.add(wl_entry)
    db.commit()
    db.refresh(wl_entry)
    return {"message": "Joined waitlist successfully", "waiting_id": wl_entry.id}

@router.post("/waitlist/{waitlist_id}/cancel")
def cancel_waitlist(waitlist_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    waitlist_entry = db.query(models.WaitingList).filter(
        models.WaitingList.id == waitlist_id,
        models.WaitingList.user_id == user_id
    ).first()
    
    if not waitlist_entry or waitlist_entry.status != "waiting":
        raise HTTPException(status_code=400, detail="Invalid active waitlist entry")
        
    waitlist_entry.status = "refunded"
    db.commit()
    
    other_users = db.query(models.WaitingList).filter(
        models.WaitingList.bus_id == waitlist_entry.bus_id,
        models.WaitingList.travel_date == waitlist_entry.travel_date,
        models.WaitingList.status == "waiting",
        models.WaitingList.position > waitlist_entry.position
    ).all()
    for u in other_users:
        u.position -= 1
    db.commit()
    return {"message": "Waitlist cancelled successfully"}

@router.get("/history")
def get_history(user_id: int = 1, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(
        models.Booking.user_id == user_id, 
        models.Booking.is_expired == False
    ).all()
    
    now = datetime.now()
    modified = False
    res = []
    
    for b in bookings:
        bus = db.query(models.Bus).filter(models.Bus.id == b.bus_id).first()
        
        # Expiry Check
        if bus and bus.departure_time:
            try:
                time_str = bus.departure_time.strftime('%H:%M:%S')
                dt_str = f"{b.travel_date} {time_str}"
                travel_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
                # Expire after departure + 30 minutes
                if now >= travel_dt + timedelta(minutes=30):
                    b.is_expired = True
                    modified = True
                    continue
            except Exception:
                pass
                
        res.append({
            "id": b.id, "bus_id": b.bus_id, "seat_id": b.seat_id,
            "route_from": bus.route_from if bus else "N/A",
            "route_to": bus.route_to if bus else "N/A",
            "travel_date": b.travel_date, "gender": b.gender,
            "status": b.status, "amount": b.amount, "created_at": b.created_at,
            "departure_time": bus.departure_time.strftime('%I:%M %p') if bus and bus.departure_time else "N/A",
            "arrival_time": bus.arrival_time.strftime('%I:%M %p') if bus and bus.arrival_time else "N/A"
        })
        
    if modified:
        db.commit()
    return res

@router.get("/user_waitlists")
def get_user_waitlists(user_id: int = 1, db: Session = Depends(get_db)):
    waitlists = db.query(models.WaitingList).filter(
        models.WaitingList.user_id == user_id,
        models.WaitingList.is_expired == False
    ).all()
    
    now = datetime.now()
    modified = False
    res = []
    
    for wl in waitlists:
        bus = db.query(models.Bus).filter(models.Bus.id == wl.bus_id).first()
        
        # Expiry Check and Auto-Refund
        if bus and bus.departure_time:
            try:
                time_str = bus.departure_time.strftime('%H:%M:%S')
                dt_str = f"{wl.travel_date} {time_str}"
                travel_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
                
                # Check absolute expiry (+30m after departure)
                if now >= travel_dt + timedelta(minutes=30):
                    wl.is_expired = True
                    modified = True
                    continue # Skip returning this entry
                
                # Check pre-departure waitlist auto-refund (-30m before departure)
                if wl.status == "waiting" and now >= travel_dt - timedelta(minutes=30):
                    wl.status = "refunded"
                    modified = True
                    
            except Exception:
                pass
                
        res.append({
            "id": wl.id, "bus_id": wl.bus_id, "position": wl.position,
            "route_from": bus.route_from if bus else "N/A",
            "route_to": bus.route_to if bus else "N/A",
            "status": wl.status, "travel_date": wl.travel_date, "gender": wl.gender,
            "amount_paid": wl.amount_paid, "created_at": wl.created_at,
            "departure_time": bus.departure_time.strftime('%I:%M %p') if bus and bus.departure_time else "N/A",
            "arrival_time": bus.arrival_time.strftime('%I:%M %p') if bus and bus.arrival_time else "N/A"
        })
        
    if modified:
        db.commit()
    return res
