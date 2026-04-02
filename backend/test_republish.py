from database import SessionLocal
import models
from buses import get_buses
from datetime import datetime

def test_republish():
    db = SessionLocal()
    try:
        print("Testing get_buses for 2026-05-15...")
        # We manually call get_buses with a Session to check behavior
        res = get_buses(date="2026-05-15", db=db)
        print(f"Buses returned: {len(res)}")
        
        # Check DB count directly
        from sqlalchemy import func
        count = db.query(models.Bus).filter(func.date(models.Bus.departure_time) == datetime(2026, 5, 15).date()).count()
        print(f"DB count for 2026-05-15: {count}")
    except Exception as e:
        print(f"Test error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_republish()
