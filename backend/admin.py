from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.delete("/buses/{bus_id}")
def delete_bus(bus_id: int, db: Session = Depends(get_db)):
    bus = db.query(models.Bus).filter(models.Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    db.delete(bus)
    db.commit()
    return {"message": "Bus deleted successfully"}

@router.put("/buses/{bus_id}")
def update_bus(bus_id: int, bus_update: schemas.BusBase, db: Session = Depends(get_db)):
    bus = db.query(models.Bus).filter(models.Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    for key, value in bus_update.dict().items():
        setattr(bus, key, value)
    db.commit()
    return bus

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total_bookings = db.query(models.Booking).filter(models.Booking.status == "booked").count()
    revenue = db.query(func.sum(models.Booking.amount)).filter(models.Booking.status == "booked", models.Booking.payment_status == "success").scalar()
    
    return {
        "total_bookings": total_bookings,
        "revenue": revenue or 0.0
    }

@router.get("/bookings")
def get_all_bookings(db: Session = Depends(get_db)):
    return db.query(models.Booking).all()
