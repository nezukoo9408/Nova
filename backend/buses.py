from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas
from redis_store import client as redis_client
import json

router = APIRouter(prefix="/api/buses", tags=["buses"])

@router.get("/", response_model=List[schemas.BusResponse])
def get_buses(date: Optional[str] = None, route_from: Optional[str] = None, route_to: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Bus)
    if route_from:
        query = query.filter(models.Bus.route_from.ilike(f"%{route_from}%"))
    if route_to:
        query = query.filter(models.Bus.route_to.ilike(f"%{route_to}%"))
    return query.all()

@router.post("/", response_model=schemas.BusResponse)
def create_bus(bus: schemas.BusBase, db: Session = Depends(get_db)):
    new_bus = models.Bus(**bus.dict())
    db.add(new_bus)
    db.commit()
    db.refresh(new_bus)
    return new_bus

@router.get("/{bus_id}/seats")
def get_bus_seats(bus_id: int, date: str, db: Session = Depends(get_db)):
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
        "waiting": waiting_count
    }
