from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.db.seed import seed_database
import app.models # ensure all models are registered

def init_db(db: Session = None) -> None:
    """Creates database tables and loads initial demonstration seed data."""
    Base.metadata.create_all(bind=engine)
    
    close_after = False
    if db is None:
        db = SessionLocal()
        close_after = True
        
    try:
        seed_database(db)
    finally:
        if close_after:
            db.close()

if __name__ == "__main__":
    print("Initializing RULIQ database and seeding demonstration records...")
    init_db()
    print("Database initialization complete.")
