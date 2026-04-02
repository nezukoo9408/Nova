from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE users ADD COLUMN has_used_first_offer BOOLEAN DEFAULT FALSE;"))
    conn.commit()
    print("Column has_used_first_offer added successfully.")
