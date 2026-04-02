from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas
from redis_store import client as redis_client
import json
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/buses", tags=["buses"])

@router.get("/", response_model=List[schemas.BusResponse])
def get_buses(date: Optional[str] = None, route_from: Optional[str] = None, route_to: Optional[str] = None, db: Session = Depends(get_db)):
    if date and route_from and route_to:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
            # Check if any buses exist for this specific date AND route
            existing_count = db.query(models.Bus).filter(
                func.date(models.Bus.departure_time) == target_date,
                models.Bus.route_from.ilike(f"%{route_from}%"),
                models.Bus.route_to.ilike(f"%{route_to}%")
            ).count()
            
            if existing_count == 0:
                # Republish logic: Clone from the most recent day that has buses for THIS route
                last_bus = db.query(models.Bus).filter(
                    models.Bus.route_from.ilike(f"%{route_from}%"),
                    models.Bus.route_to.ilike(f"%{route_to}%")
                ).order_by(models.Bus.departure_time.desc()).first()
                
                if last_bus:
                    last_date = last_bus.departure_time.date()
                    if target_date > last_date:
                        template_buses = db.query(models.Bus).filter(
                            func.date(models.Bus.departure_time) == last_date,
                            models.Bus.route_from.ilike(f"%{route_from}%"),
                            models.Bus.route_to.ilike(f"%{route_to}%")
                        ).all()
                        
                        days_diff = (target_date - last_date).days
                        new_buses = []
                        for b in template_buses:
                            new_buses.append(models.Bus(
                                name=b.name, route_from=b.route_from, route_to=b.route_to,
                                departure_time=b.departure_time + timedelta(days=days_diff),
                                arrival_time=b.arrival_time + timedelta(days=days_diff),
                                price_non_ac=b.price_non_ac, price_ac=b.price_ac,
                                base_price_lower=b.base_price_lower, base_price_upper=b.base_price_upper,
                                is_ac=b.is_ac
                            ))
                        db.add_all(new_buses)
                        db.commit()
        except Exception as e:
            print(f"Republish error: {e}")

    query = db.query(models.Bus)
    if route_from:
        query = query.filter(models.Bus.route_from.ilike(f"%{route_from}%"))
    if route_to:
        query = query.filter(models.Bus.route_to.ilike(f"%{route_to}%"))
    
    if date:
        # Filter by the requested date specifically
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
            query = query.filter(func.date(models.Bus.departure_time) == target_date)
        except:
            pass

    buses = query.all()
    if date:
        valid_buses = []
        now = datetime.now()
        for bus in buses:
            is_closed = False
            if bus.departure_time:
                if now >= bus.departure_time - timedelta(minutes=15):
                    is_closed = True
            if not is_closed:
                valid_buses.append(bus)
        return valid_buses
        
    return buses

@router.post("/", response_model=schemas.BusResponse)
def create_bus(bus: schemas.BusBase, db: Session = Depends(get_db)):
    new_bus = models.Bus(**bus.dict())
    db.add(new_bus)
    db.commit()
    db.refresh(new_bus)
    return new_bus

@router.get("/{bus_id}/seats")
def get_bus_seats(bus_id: int, date: str, db: Session = Depends(get_db)):
    bus = db.query(models.Bus).filter(models.Bus.id == bus_id).first()
    is_booking_closed = False
    
    if bus and bus.departure_time:
        try:
            now = datetime.now()
            time_obj = bus.departure_time.time()
            travel_date_obj = datetime.strptime(date, "%Y-%m-%d").date()
            travel_dt = datetime.combine(travel_date_obj, time_obj)
            if now >= travel_dt - timedelta(minutes=15):
                is_booking_closed = True
        except Exception:
            pass
            
    # Get all locked seats from redis
    keys = redis_client.keys(f"locked_seat:{bus_id}:{date}:*")
    locked_seats = []
    for k in keys:
        seat_id = k.split(":")[-1]
        locked_seats.append(seat_id)
        
    # Get all booked seats from db
    bookings = db.query(models.Booking).filter(
        models.Booking.bus_id == bus_id,
        models.Booking.travel_date == date,
        models.Booking.status == "booked"
    ).all()
    
    waiting_count = db.query(models.WaitingList).filter(
        models.WaitingList.bus_id == bus_id,
        models.WaitingList.travel_date == date,
        models.WaitingList.status == "waiting"
    ).count()
    
    booked_details = {}
    for b in bookings:
        if b.status == "booked":
            booked_details[b.seat_id] = {"gender": b.gender}
            
    return {
        "bus_id": bus_id,
        "date": date,
        "locked": locked_seats,
        "booked": booked_details,
        "waiting": waiting_count,
        "is_booking_closed": is_booking_closed
    }
