from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    username = Column(String(100), unique=True, index=True, nullable=True)
    password = Column(String(255), nullable=True)
    gender = Column(String(10), nullable=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    role = Column(String(50), default="user")
    created_at = Column(DateTime(timezone=True), default=func.now())

class Bus(Base):
    __tablename__ = "buses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    route_from = Column(String(100))
    route_to = Column(String(100))
    departure_time = Column(DateTime)
    arrival_time = Column(DateTime)
    price_non_ac = Column(Float)
    price_ac = Column(Float)
    base_price_lower = Column(Float)
    base_price_upper = Column(Float)
    is_ac = Column(Boolean, default=False)

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    bus_id = Column(Integer, ForeignKey("buses.id"))
    seat_id = Column(String(10))
    travel_date = Column(String(20)) # YYYY-MM-DD
    gender = Column(String(10)) # Male/Female
    status = Column(String(20)) # booked/cancelled/waiting
    payment_status = Column(String(20)) # pending/success/failed
    amount = Column(Float)
    is_expired = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    user = relationship("User")
    bus = relationship("Bus")

class WaitingList(Base):
    __tablename__ = "waiting_list"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    bus_id = Column(Integer, ForeignKey("buses.id"))
    position = Column(Integer) # 1 or 2
    status = Column(String(20)) # waiting / confirmed / refunded
    travel_date = Column(String(20)) # YYYY-MM-DD
    gender = Column(String(10)) # Male/Female
    amount_paid = Column(Float)
    is_expired = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    user = relationship("User")
    bus = relationship("Bus")
