from sqlalchemy import create_engine, text

engine = create_engine('mysql+pymysql://root:root@127.0.0.1:3306/bus_booking')
with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE'))
        print("Added username")
    except Exception as e:
        print(f"Error adding username: {e}")
        
    try:
        conn.execute(text('ALTER TABLE users ADD COLUMN password VARCHAR(255)'))
        print("Added password")
    except Exception as e:
        print(f"Error adding password: {e}")
        
    try:
        conn.execute(text('ALTER TABLE users ADD COLUMN gender VARCHAR(10)'))
        print("Added gender")
    except Exception as e:
        print(f"Error adding gender: {e}")
    
    conn.commit()

print("Database columns addition completed!")
