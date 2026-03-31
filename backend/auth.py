from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta
from database import get_db
import models, schemas
from passlib.context import CryptContext
from sqlalchemy import or_

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = "bus_booking_secret_key"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        or_(models.User.email == user.email, models.User.username == user.username)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email or Username already registered")
        
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        username=user.username,
        password=hashed_password,
        gender=user.gender
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(request: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        or_(models.User.email == request.username, models.User.username == request.username)
    ).first()
    
    if not user or not user.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
        
    if not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
        
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "id": user.id, 
        "name": user.name, 
        "email": user.email, 
        "username": user.username,
        "gender": user.gender,
        "role": user.role, 
        "token": access_token
    }
