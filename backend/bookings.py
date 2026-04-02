from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
import email_utils
from redis_store import client as redis_client
from datetime import datetime, timedelta
from auth import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

def is_booking_allowed(bus_id: int, travel_date: str, db: Session) -> bool:
    bus = db.query(models.Bus).filter(models.Bus.id == bus_id).first()
    if not bus or not bus.departure_time:
        return True
    try:
        now = datetime.now()
        travel_dt = datetime.combine(datetime.strptime(travel_date, "%Y-%m-%d").date(), bus.departure_time.time())
        if now >= travel_dt - timedelta(minutes=15):
            return False
    except Exception:
        pass
    return True

@router.post("/lock")
def lock_seat(req: schemas.SeatLockRequest, db: Session = Depends(get_db)):
    if not is_booking_allowed(req.bus_id, req.travel_date, db):
        raise HTTPException(status_code=400, detail="Booking closed for this bus")
        
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
    
    # Check if locked by someone else — skip in simulation (overwrite stale locks)
    # redis_client.get(key) check removed: a fresh selection always wins the 5-min hold
        
    # Lock for 5 minutes (300 seconds)
    redis_client.setex(key, 300, "locked_temporarily")
    return {"message": "Seat locked successfully for 5 minutes."}

@router.get("/check-first-offer")
def check_first_offer(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns whether the current user is eligible for the FIRST200 first-booking offer."""
    eligible = not current_user.has_used_first_offer
    return {"eligible": eligible, "discount": 200, "code": "FIRST200"}

@router.post("/confirm")
def confirm_booking(req: schemas.BookingRequest, background_tasks: BackgroundTasks, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_booking_allowed(req.bus_id, req.travel_date, db):
        raise HTTPException(status_code=400, detail="Booking closed for this bus")
        
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

    # Validate FIRST200 coupon on backend
    if req.applied_coupon == "FIRST200":
        if current_user.has_used_first_offer:
            raise HTTPException(status_code=400, detail="First booking offer has already been used.")
        
    # Create booking with the discounted amount passed from frontend
    booking = models.Booking(
        user_id=current_user.id,
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
    
    # Mark first offer as used if FIRST200 was applied
    if req.applied_coupon == "FIRST200" and not current_user.has_used_first_offer:
        current_user.has_used_first_offer = True
        db.commit()
    
    # Remove lock
    redis_client.delete(key)
    
    # Send booking confirmation email
    bus = db.query(models.Bus).filter(models.Bus.id == req.bus_id).first()
    if bus:
        dt = f"{req.travel_date} {bus.departure_time.strftime('%I:%M %p') if bus.departure_time else ''}"
        bus_type = f"{'AC' if bus.is_ac else 'Non-AC'}"
        html_body = email_utils.template_booking_confirmation(
            name=current_user.name,
            email=current_user.email,
            route_from=bus.route_from,
            route_to=bus.route_to,
            date=dt.strip(),
            seat=req.seat_id,
            bus_type=bus_type,
            amount=req.amount,
            booking_id=booking.id
        )
        background_tasks.add_task(email_utils.send_email, current_user.email, "Nova Booking Confirmation 🎟️", html_body)
    
    return {"message": "Booking confirmed successfully", "booking_id": booking.id}

@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: int, background_tasks: BackgroundTasks, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id, models.Booking.user_id == current_user.id).first()
    if not booking or booking.status != "booked":
        raise HTTPException(status_code=400, detail="Invalid booking")
        
    booking.status = "cancelled"
    db.commit()
    
    # Send cancellation email for the user
    bus = db.query(models.Bus).filter(models.Bus.id == booking.bus_id).first()
    if bus:
        dt = f"{booking.travel_date} {bus.departure_time.strftime('%I:%M %p') if bus.departure_time else ''}"
        html_body = email_utils.template_cancellation(
            name=current_user.name,
            route_from=bus.route_from,
            route_to=bus.route_to,
            date=dt.strip(),
            seat=booking.seat_id,
            is_waitlist=False,
            tracking_id=booking.id
        )
        background_tasks.add_task(email_utils.send_email, current_user.email, "Nova Ticket Cancellation ❌", html_body)
    
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
        
        # Send Waitlist -> Confirmed email
        actual_wl_user = db.query(models.User).filter(models.User.id == waitlist_user.user_id).first()
        if actual_wl_user and bus:
            wl_dt = f"{booking.travel_date} {bus.departure_time.strftime('%I:%M %p') if bus.departure_time else ''}"
            wl_bus_type = f"{'AC' if bus.is_ac else 'Non-AC'}"
            wl_html_body = email_utils.template_waitlist_confirmed(
                name=actual_wl_user.name,
                route_from=bus.route_from,
                route_to=bus.route_to,
                date=wl_dt.strip(),
                seat=booking.seat_id,
                bus_type=wl_bus_type
            )
            background_tasks.add_task(email_utils.send_email, actual_wl_user.email, "Nova Seat Confirmed 🎉", wl_html_body)
        
    return {"message": "Booking cancelled", "auto_assigned": assigned_to_waitlist}

@router.get("/verify_waitlist_status")
def verify_waitlist_status(bus_id: int, date: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_booking_allowed(bus_id, date, db):
        raise HTTPException(status_code=400, detail="Booking closed for this bus")
        
    existing = db.query(models.WaitingList).filter(
        models.WaitingList.bus_id == bus_id,
        models.WaitingList.travel_date == date,
        models.WaitingList.user_id == current_user.id,
        models.WaitingList.status == "waiting"
    ).first()
    return {"already_in_waitlist": existing is not None}

@router.post("/waitlist")
def join_waitlist(req: schemas.BookingRequest, background_tasks: BackgroundTasks, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_booking_allowed(req.bus_id, req.travel_date, db):
        raise HTTPException(status_code=400, detail="Booking closed for this bus")
        
    existing = db.query(models.WaitingList).filter(
        models.WaitingList.bus_id == req.bus_id,
        models.WaitingList.travel_date == req.travel_date,
        models.WaitingList.user_id == current_user.id,
        models.WaitingList.status == "waiting"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Only one waiting list entry is allowed per person per bus. You cannot book more than one.")
        
    waitlist_count = db.query(models.WaitingList).filter(
        models.WaitingList.bus_id == req.bus_id,
        models.WaitingList.travel_date == req.travel_date,
        models.WaitingList.status == "waiting"
    ).count()
    
    if waitlist_count >= 2:
        raise HTTPException(status_code=400, detail="Waitlist is full (max 2).")
        
    wl_entry = models.WaitingList(
        user_id=current_user.id,
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
    
    # Send Waitlist confirmation email
    bus = db.query(models.Bus).filter(models.Bus.id == req.bus_id).first()
    if bus:
        dt = f"{req.travel_date} {bus.departure_time.strftime('%I:%M %p') if bus.departure_time else ''}"
        html_body = email_utils.template_waiting_list(
            name=current_user.name,
            route_from=bus.route_from,
            route_to=bus.route_to,
            date=dt.strip(),
            position=wl_entry.position,
            amount=req.amount
        )
        background_tasks.add_task(email_utils.send_email, current_user.email, "Nova Waitlist Confirmation ⏳", html_body)

    return {"message": "Joined waitlist successfully", "waiting_id": wl_entry.id}

@router.post("/waitlist/{waitlist_id}/cancel")
def cancel_waitlist(waitlist_id: int, background_tasks: BackgroundTasks, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    waitlist_entry = db.query(models.WaitingList).filter(
        models.WaitingList.id == waitlist_id,
        models.WaitingList.user_id == current_user.id
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
    
    # Send Cancellation Email
    bus = db.query(models.Bus).filter(models.Bus.id == waitlist_entry.bus_id).first()
    if bus:
        dt = f"{waitlist_entry.travel_date} {bus.departure_time.strftime('%I:%M %p') if bus.departure_time else ''}"
        html_body = email_utils.template_cancellation(
            name=current_user.name,
            route_from=bus.route_from,
            route_to=bus.route_to,
            date=dt.strip(),
            seat="",
            is_waitlist=True,
            tracking_id=waitlist_entry.id
        )
        background_tasks.add_task(email_utils.send_email, current_user.email, "Nova Ticket Cancellation ❌", html_body)

    return {"message": "Waitlist cancelled successfully"}

@router.get("/history")
def get_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id, 
        models.Booking.is_expired == False
    ).all()
    
    now = datetime.now()
    modified = False
    res = []
    
    for b in bookings:
        bus = db.query(models.Bus).filter(models.Bus.id == b.bus_id).first()
        
        status = b.status
        # Handle Lifecycle: ongoing / completed
        if bus and bus.departure_time and bus.arrival_time and b.status == "booked":
            try:
                now = datetime.now()
                dep_time = bus.departure_time.time()
                arr_time = bus.arrival_time.time()
                travel_date_obj = datetime.strptime(b.travel_date, "%Y-%m-%d").date()
                
                departure_dt = datetime.combine(travel_date_obj, dep_time)
                arrival_dt = datetime.combine(travel_date_obj, arr_time)
                # Handle cases where arrival is the next day
                if arrival_dt <= departure_dt:
                    arrival_dt += timedelta(days=1)

                if now >= arrival_dt:
                    status = "completed"
                elif now >= departure_dt:
                    status = "ongoing"
            except Exception as e:
                print(f"Lifecycle error for booking {b.id}: {e}")

        # Expiry Check
        if bus and bus.departure_time:
            try:
                time_obj = bus.departure_time.time()
                travel_date_obj = datetime.strptime(b.travel_date, "%Y-%m-%d").date()
                travel_dt = datetime.combine(travel_date_obj, time_obj)
                
                # Expire from history list ONLY if cancelled or old -- keep completed/ongoing for record?
                # Actually user said "transferred to completed", so we should show them.
                # If departure was > 24h ago, we can mark as is_expired
                if now >= travel_dt + timedelta(days=1):
                    b.is_expired = True
                    modified = True
                    continue
            except Exception as e:
                print(f"Error parsing booking travel_date {b.travel_date} for expiry: {e}")
                pass
                
        res.append({
            "id": b.id, "bus_id": b.bus_id, "seat_id": b.seat_id,
            "route_from": bus.route_from if bus else "N/A",
            "route_to": bus.route_to if bus else "N/A",
            "travel_date": b.travel_date, "gender": b.gender,
            "status": status, "amount": b.amount, "created_at": b.created_at,
            "departure_time": bus.departure_time.strftime('%I:%M %p') if bus and bus.departure_time else "N/A",
            "arrival_time": bus.arrival_time.strftime('%I:%M %p') if bus and bus.arrival_time else "N/A"
        })
        
    if modified:
        db.commit()
    return res

@router.get("/user_waitlists")
def get_user_waitlists(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    waitlists = db.query(models.WaitingList).filter(
        models.WaitingList.user_id == current_user.id,
        models.WaitingList.is_expired == False
    ).all()
    
    now = datetime.now()
    modified = False
    res = []
    
    for wl in waitlists:
        bus = db.query(models.Bus).filter(models.Bus.id == wl.bus_id).first()
        
        status = wl.status
        # Handle Lifecycle: unsuccessful if bus arrived
        if bus and bus.arrival_time and wl.status == "waiting":
            try:
                now = datetime.now()
                arr_time = bus.arrival_time.time()
                dep_time = bus.departure_time.time()
                travel_date_obj = datetime.strptime(wl.travel_date, "%Y-%m-%d").date()
                arrival_dt = datetime.combine(travel_date_obj, arr_time)
                departure_dt = datetime.combine(travel_date_obj, dep_time)
                if arrival_dt <= departure_dt:
                    arrival_dt += timedelta(days=1)

                if now >= arrival_dt:
                    status = "unsuccessful"
                    # Update DB permanently
                    wl.status = "unsuccessful"
                    modified = True
            except Exception as e:
                print(f"Waitlist Lifecycle error for {wl.id}: {e}")

        # Expiry Check and Auto-Refund
        if bus and bus.departure_time:
            try:
                time_obj = bus.departure_time.time()
                travel_date_obj = datetime.strptime(wl.travel_date, "%Y-%m-%d").date()
                travel_dt = datetime.combine(travel_date_obj, time_obj)
                
                # Check absolute expiry (+24h after departure)
                if datetime.now() >= travel_dt + timedelta(days=1):
                    wl.is_expired = True
                    modified = True
                    continue # Skip returning this entry
                
                # Check pre-departure waitlist auto-refund (-30m before departure)
                if wl.status == "waiting" and datetime.now() >= travel_dt - timedelta(minutes=30):
                    wl.status = "refunded"
                    modified = True
                    status = "refunded"
                    
            except Exception as e:
                print(f"Error parsing waitlist travel_date {wl.travel_date} for expiry: {e}")
                pass
                
        res.append({
            "id": wl.id, "bus_id": wl.bus_id, "position": wl.position,
            "route_from": bus.route_from if bus else "N/A",
            "route_to": bus.route_to if bus else "N/A",
            "status": status, "travel_date": wl.travel_date, "gender": wl.gender,
            "amount_paid": wl.amount_paid, "created_at": wl.created_at,
            "departure_time": bus.departure_time.strftime('%I:%M %p') if bus and bus.departure_time else "N/A",
            "arrival_time": bus.arrival_time.strftime('%I:%M %p') if bus and bus.arrival_time else "N/A"
        })
        
    if modified:
        db.commit()
    return res
