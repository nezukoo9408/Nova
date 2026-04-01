from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    username: str
    password: str
    gender: str

class UserLogin(BaseModel):
    username: str # Accepts either username or email
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    class Config:
        from_attributes = True

class BusBase(BaseModel):
    name: str
    route_from: str
    route_to: str
    departure_time: datetime
    arrival_time: datetime
    price_non_ac: float
    price_ac: float
    base_price_lower: float
    base_price_upper: float
    is_ac: bool

class BusResponse(BusBase):
    id: int
    class Config:
        from_attributes = True

class SeatLockRequest(BaseModel):
    bus_id: int
    seat_id: str
    travel_date: str

class BookingRequest(BaseModel):
    bus_id: int
    seat_id: str
    travel_date: str
    gender: str
    amount: float
    applied_coupon: Optional[str] = None

class WaitlistResponse(BaseModel):
    id: int
    user_id: int
    bus_id: int
    position: int
    status: str
    travel_date: str
    gender: str
    amount_paid: float
    created_at: datetime
    class Config:
        from_attributes = True
