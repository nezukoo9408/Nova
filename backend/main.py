from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
import auth, buses, bookings, admin
from database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bus Booking System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(buses.router)
app.include_router(bookings.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Bus Booking API"}
