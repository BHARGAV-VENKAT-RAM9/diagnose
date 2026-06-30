from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Engine setup
engine = create_engine(
    settings.DATABASE_URL,
    # pool_pre_ping checks if connection is alive; useful for persistent cloud databases
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dynamically add assigned_phlebotomist column if it doesn't exist
from sqlalchemy import text
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_phlebotomist VARCHAR(100);"))
except Exception as e:
    print("Warning: Dynamic schema migration failed:", e)


Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
