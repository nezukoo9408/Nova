"""
Run this script ONCE to add the has_used_first_offer column to the existing users table.
Works with both local MySQL and Railway (reads DATABASE_URL from environment).
"""
from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN has_used_first_offer BOOLEAN NOT NULL DEFAULT 0"
        ))
        conn.commit()
        print("✅  Added 'has_used_first_offer' column to users table.")
    except Exception as e:
        print(f"⚠️  Column may already exist: {e}")

print("Migration complete.")
