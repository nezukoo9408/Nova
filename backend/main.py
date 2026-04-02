from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
import auth, buses, bookings, admin
from database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bus Booking System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000"],
    allow_origin_regex=r"https://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    print("GLOBAL EXCEPTION:", exc)
    traceback.print_exc()
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=500, content={"detail": str(exc)})

app.include_router(auth.router)
app.include_router(buses.router)
app.include_router(bookings.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Bus Booking API"}
