from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Table
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    username = Column(String(60), unique=True, index=True, nullable=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(255), default="")
    university = Column(String(120), default="UC Berkeley") # alias for college
    major = Column(String(120), default="Computer Science")      # alias for course
    college = Column(String(150), default="UC Berkeley")
    course = Column(String(150), default="Computer Science")
    academic_year = Column(String(50), default="Junior (3rd Year)")
    graduation_year = Column(Integer, default=2026)
    bio = Column(Text, default="")
    is_onboarded = Column(Boolean, default=False)
    terms_agreed = Column(Boolean, default=True)
    rating = Column(Float, default=5.0)
    review_count = Column(Integer, default=0)
    sessions_completed = Column(Integer, default=0)
    xp = Column(Integer, default=1000)
    level = Column(Integer, default=1)
    time_credits = Column(Integer, default=5) # 1 credit = 1 hour session barter
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    availabilities = relationship("Availability", back_populates="user", cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="user", cascade="all, delete-orphan")
    learning_goals = relationship("LearningGoal", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    learning_style = Column(String(255), default="One-to-one, Project-based")
    skill_level = Column(String(50), default="Intermediate")
    headline = Column(String(200), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(String(30), nullable=False) # Monday, Tuesday, ...
    time_slots = Column(String(255), default="Evening (5 PM - 9 PM)")
    is_available = Column(Boolean, default=True)

    user = relationship("User", back_populates="availabilities")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), index=True, nullable=False) # Tech, Design, Data, Languages, Business, Academics, Music
    icon = Column(String(50), default="Code")
    description = Column(String(255), default="")

    user_skills = relationship("UserSkill", back_populates="skill")

class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    skill_type = Column(String(20), nullable=False) # 'teach' or 'learn'
    proficiency = Column(String(30), default="Intermediate") # Beginner, Intermediate, Advanced, Expert
    endorsements_count = Column(Integer, default=0)

    user = relationship("User", back_populates="skills")
    skill = relationship("Skill", back_populates="user_skills")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, default="")
    scheduled_at = Column(String(50), nullable=False) # ISO or formatted string
    duration_minutes = Column(Integer, default=60)
    status = Column(String(30), default="confirmed") # pending, confirmed, completed, cancelled
    meeting_link = Column(String(255), default="https://meet.skillswap.edu/room-")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    learner = relationship("User", foreign_keys=[learner_id])
    teacher = relationship("User", foreign_keys=[teacher_id])
    skill = relationship("Skill")
    review = relationship("Review", back_populates="session", uselist=False)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), unique=True, nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("Session", back_populates="review")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    reviewee = relationship("User", foreign_keys=[reviewee_id])

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    issuer = Column(String(120), nullable=False)
    issue_date = Column(String(50), default="2026")
    credential_url = Column(String(255), default="")
    credential_id = Column(String(100), default="")
    badge_icon = Column(String(50), default="Award")
    is_verified = Column(Boolean, default=True)

    user = relationship("User", back_populates="certificates")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

class LearningGoal(Base):
    __tablename__ = "learning_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    target_date = Column(String(50), default="Next month")
    progress_pct = Column(Integer, default=0) # 0 to 100
    status = Column(String(30), default="in_progress") # in_progress, completed

    user = relationship("User", back_populates="learning_goals")

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(50), default="Sparkles")
    category = Column(String(50), default="Mentorship")
    xp_value = Column(Integer, default=250)

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False)
    awarded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="badges")
    badge = relationship("Badge")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    skills_needed = Column(String(255), default="") # Comma-separated or tags
    team_size = Column(Integer, default=3)
    status = Column(String(30), default="open") # open, in_progress, completed
    github_url = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", foreign_keys=[creator_id])

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30), default="system") # session, message, badge, review, swap
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
