from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Get DATABASE_URL from environment (Render)
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback for local development (optional)
if not DATABASE_URL:
    DATABASE_URL = "mysql+pymysql://root:root@127.0.0.1:3306/bus_booking"

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True  # helps avoid connection issues
)

# Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base model
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()