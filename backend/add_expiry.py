from sqlalchemy import create_engine, text

engine = create_engine('mysql+pymysql://root:root@127.0.0.1:3306/bus_booking')
with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE bookings ADD COLUMN is_expired BOOLEAN DEFAULT FALSE'))
        print("Added is_expired to bookings")
    except Exception as e:
        print(f"Error on bookings: {e}")
        
    try:
        conn.execute(text('ALTER TABLE waiting_list ADD COLUMN is_expired BOOLEAN DEFAULT FALSE'))
        print("Added is_expired to waiting_list")
    except Exception as e:
        print(f"Error on waiting_list: {e}")
    
    conn.commit()

print("Schema migration completed")
