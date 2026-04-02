from database import SessionLocal, engine
import models
from datetime import datetime, timedelta

def populate():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Clear existing buses to avoid duplicates during this specific mapping
        db.query(models.Bus).delete()
        db.commit()

        start_date = datetime.now().date()
        route_pairs = [("Pune", "Mumbai"), ("Bengaluru", "Mysuru")]
        
        buses_to_add = []
        
        for i in range(10):
            current_date = start_date + timedelta(days=i)
            
            for base_from, base_to in route_pairs:
                # 10 buses per day per route: 5 one way, 5 the other
                for j in range(5):
                    # Forward
                    dep_f = datetime.combine(current_date, datetime.strptime(f"{8 + j*2}:00", "%H:%M").time())
                    arr_f = dep_f + timedelta(hours=3)
                    buses_to_add.append(models.Bus(
                        name=f"Nova Express {base_from[0]}-{base_to[0]} {j+1}",
                        route_from=base_from,
                        route_to=base_to,
                        departure_time=dep_f,
                        arrival_time=arr_f,
                        price_non_ac=500 + j*50,
                        price_ac=800 + j*50,
                        base_price_lower=500,
                        base_price_upper=1000,
                        is_ac=(j % 2 == 0)
                    ))
                    
                    # Return
                    dep_r = datetime.combine(current_date, datetime.strptime(f"{9 + j*2}:30", "%H:%M").time())
                    arr_r = dep_r + timedelta(hours=3, minutes=15)
                    buses_to_add.append(models.Bus(
                        name=f"Nova Express {base_to[0]}-{base_from[0]} {j+1}",
                        route_from=base_to,
                        route_to=base_from,
                        departure_time=dep_r,
                        arrival_time=arr_r,
                        price_non_ac=550 + j*40,
                        price_ac=850 + j*40,
                        base_price_lower=550,
                        base_price_upper=1100,
                        is_ac=(j % 2 != 0)
                    ))
        
        db.add_all(buses_to_add)
        db.commit()
        print(f"Successfully seeded {len(buses_to_add)} buses for 10 days.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding buses: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    populate()
