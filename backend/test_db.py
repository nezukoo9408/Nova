from database import SessionLocal
import models
db = SessionLocal()
bus = db.query(models.Bus).first()
if bus:
    print("BUS ID:", bus.id)
    print("base_price_lower:", bus.base_price_lower)
    print("base_price_upper:", bus.base_price_upper)
else:
    print("NO BUSES FOUND")
