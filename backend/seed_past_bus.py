from database import SessionLocal
import models
from datetime import datetime, timedelta

def seed_past_bus():
    db = SessionLocal()
    try:
        # Yesterday
        yesterday = datetime.now() - timedelta(days=1)
        dep_time = yesterday.replace(hour=8, minute=0, second=0)
        arr_time = yesterday.replace(hour=11, minute=0, second=0)
        
        past_bus = models.Bus(
            name="Nova Classic (Past)",
            route_from="Bengaluru",
            route_to="Mysuru",
            departure_time=dep_time,
            arrival_time=arr_time,
            price_non_ac=400,
            price_ac=600,
            base_price_lower=400,
            base_price_upper=800,
            is_ac=False
        )
        db.add(past_bus)
        db.commit()
        db.refresh(past_bus)
        print(f"Seeded past bus with ID {past_bus.id} for {yesterday.date()}")
        
        # Optionally add a booking for this bus for the current user (if I knew the ID)
        # But the user can just search for it or I can just say it's there.
        # Actually, let's just seed the bus and tell the user to check their history if they book it.
    except Exception as e:
        print(f"Error seeding past bus: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_past_bus()
