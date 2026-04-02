from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Load .env file for local development
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Get DATABASE_URL from environment (Railway/Render/Production)
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback for local development (optional)
if not DATABASE_URL:
    DATABASE_URL = "mysql+pymysql://root:rehan15@127.0.0.1:3306/bus_booking"

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