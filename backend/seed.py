from database import SessionLocal, engine
import models
from datetime import datetime, timedelta

print("DROPPING TABLES FOR SCHEMA UPDATE...")
try:
    models.Booking.__table__.drop(engine)
    models.Bus.__table__.drop(engine)
except Exception as e:
    print(f"Drop error: {e}")

try:
    models.Bus.__table__.create(engine)
    models.Booking.__table__.create(engine)
except Exception as e:
    print(f"Create error: {e}")

db = SessionLocal()

todayStr = datetime.now().strftime("%Y-%m-%d")
def mkbus(name, f, t, dep_h, dep_m, arr_h, arr_m, is_ac, price):
    dep = datetime.strptime(f"{todayStr} {dep_h:02d}:{dep_m:02d}", "%Y-%m-%d %H:%M")
    arr = datetime.strptime(f"{todayStr} {arr_h:02d}:{arr_m:02d}", "%Y-%m-%d %H:%M")
    if arr <= dep:
        arr += timedelta(days=1)
    type_name = "AC" if is_ac else "Non-AC"
    return models.Bus(
        name=f"Nova {type_name}", route_from=f, route_to=t,
        departure_time=dep, arrival_time=arr,
        price_non_ac=price if not is_ac else 0, price_ac=price if is_ac else 0,
        base_price_lower=price, base_price_upper=price-200, is_ac=is_ac
    )

buses = [
    mkbus("Nova AC", "Bengaluru", "Mysuru", 19, 0, 22, 30, True, 1200),
    mkbus("Nova Non-AC", "Bengaluru", "Mysuru", 21, 0, 0, 30, False, 900),
    mkbus("Nova AC", "Bengaluru", "Mangaluru", 20, 0, 5, 0, True, 1800),
    mkbus("Nova Non-AC", "Bengaluru", "Mangaluru", 21, 30, 6, 30, False, 1400),
    mkbus("Nova AC", "Bengaluru", "Hubballi", 20, 0, 4, 0, True, 1700),
    mkbus("Nova Non-AC", "Bengaluru", "Hubballi", 22, 0, 6, 0, False, 1300),
    mkbus("Nova AC", "Bengaluru", "Belagavi", 19, 0, 5, 0, True, 2000),
    mkbus("Nova Non-AC", "Bengaluru", "Belagavi", 21, 0, 7, 0, False, 1500),
    mkbus("Nova AC", "Bengaluru", "Shivamogga", 20, 0, 3, 0, True, 1500),
    mkbus("Nova Non-AC", "Bengaluru", "Shivamogga", 21, 30, 4, 30, False, 1200),
    mkbus("Nova AC", "Mysuru", "Mangaluru", 20, 0, 3, 0, True, 1600),
    mkbus("Nova Non-AC", "Mysuru", "Mangaluru", 21, 0, 4, 0, False, 1300),
    mkbus("Nova AC", "Mysuru", "Bengaluru", 19, 30, 23, 0, True, 1100),
    mkbus("Nova Non-AC", "Mysuru", "Bengaluru", 21, 0, 0, 30, False, 800),
    mkbus("Nova AC", "Hubballi", "Bengaluru", 20, 0, 4, 0, True, 1700),
    mkbus("Nova Non-AC", "Hubballi", "Bengaluru", 22, 0, 6, 0, False, 1300),
    mkbus("Nova AC", "Mangaluru", "Udupi", 19, 0, 20, 30, True, 900),
    mkbus("Nova Non-AC", "Mangaluru", "Udupi", 21, 0, 22, 30, False, 800),
    mkbus("Nova AC", "Shivamogga", "Mangaluru", 20, 0, 2, 0, True, 1400),
    mkbus("Nova Non-AC", "Shivamogga", "Mangaluru", 21, 30, 3, 30, False, 1100),
]
try:
    db.add_all(buses)
    db.commit()
    print("Seeded specific prompt rules correctly!")
except Exception as e:
    print(f"Insertion error: {e}")
