from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import Base
import os

# Database URL from environment variable or default to SQLite for development
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/veridiadb"
)

# For SQLite fallback during development without PostgreSQL
if not os.getenv("DATABASE_URL"):
    DATABASE_URL = "sqlite:///./veridiaapp.db"
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
