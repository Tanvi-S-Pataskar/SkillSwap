import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
    if "sqlite" in SQLALCHEMY_DATABASE_URL:
        engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    DB_DIR = os.path.dirname(os.path.abspath(__file__))
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(DB_DIR, '..', 'skillswap.db')}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Non-destructive table creation and schema migration for Part 3."""
    Base.metadata.create_all(bind=engine)
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    with engine.connect() as conn:
        # 1. Update certificates columns if missing
        existing_cert_cols = [c["name"] for c in inspector.get_columns("certificates")]
        cert_migrations = {
            "verification_status": "VARCHAR(30) DEFAULT 'Pending'",
            "related_skill": "VARCHAR(100) DEFAULT ''",
            "file_path": "VARCHAR(255) DEFAULT ''",
            "file_name": "VARCHAR(255) DEFAULT ''",
            "file_size": "INTEGER DEFAULT 0",
            "mime_type": "VARCHAR(100) DEFAULT ''",
            "created_at": "DATETIME",
        }
        for col_name, col_type in cert_migrations.items():
            if col_name not in existing_cert_cols:
                conn.execute(text(f"ALTER TABLE certificates ADD COLUMN {col_name} {col_type}"))
                conn.commit()

        # Update existing verified demo certificates
        conn.execute(text("UPDATE certificates SET verification_status = 'Verified' WHERE is_verified = 1 AND (verification_status IS NULL OR verification_status = 'Pending')"))
        conn.commit()

        # 2. Update users columns if missing
        existing_user_cols = [c["name"] for c in inspector.get_columns("users")]
        if "is_admin" not in existing_user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
            conn.commit()

        # Ensure user 1 (Maya Lin) has admin privileges for testing admin actions
        conn.execute(text("UPDATE users SET is_admin = 1 WHERE id = 1"))
        conn.commit()
