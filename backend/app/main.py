from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine, Base, SessionLocal
from .seed_data import seed_database
from .routers import auth, students, skills, sessions, certificates, messages, community, stats

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed realistic data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="SkillSwap API",
    description="Peer-to-Peer Student Skill Exchange Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(skills.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(certificates.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(community.router, prefix="/api")
app.include_router(stats.router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "SkillSwap API",
        "tagline": "Learn From Students. Teach What You Know. Grow Together.",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "SkillSwap Backend"}
