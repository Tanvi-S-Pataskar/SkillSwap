from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import timedelta
import re

from ..database import get_db
from ..models import User, UserSkill, Skill, Profile, Availability, UserBadge, Badge
from ..schemas import (
    UserLogin, UserRegister, ForgotPasswordRequest, OnboardingSubmit,
    UserProfileOut, UserSummary
)
from ..security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

def format_user_profile(user: User) -> dict:
    teaching = [us.skill.name for us in user.skills if us.skill_type == "teach"]
    learning = [us.skill.name for us in user.skills if us.skill_type == "learn"]
    skills_out = []
    for us in user.skills:
        skills_out.append({
            "id": us.id,
            "skill_id": us.skill_id,
            "name": us.skill.name,
            "category": us.skill.category,
            "icon": us.skill.icon,
            "skill_type": us.skill_type,
            "proficiency": us.proficiency,
            "endorsements_count": us.endorsements_count,
        })

    certs_out = [
        {
            "id": c.id,
            "title": c.title,
            "issuer": c.issuer,
            "issue_date": c.issue_date,
            "credential_url": c.credential_url,
            "credential_id": c.credential_id,
            "badge_icon": c.badge_icon,
            "is_verified": c.is_verified,
        }
        for c in user.certificates
    ]

    goals_out = [
        {
            "id": g.id,
            "title": g.title,
            "target_date": g.target_date,
            "progress_pct": g.progress_pct,
            "status": g.status,
        }
        for g in user.learning_goals
    ]

    badges_out = [
        {
            "id": ub.badge.id,
            "name": ub.badge.name,
            "description": ub.badge.description,
            "icon": ub.badge.icon,
            "category": ub.badge.category,
            "xp_value": ub.badge.xp_value,
        }
        for ub in user.badges if ub.badge
    ]

    availabilities_out = [
        {
            "id": a.id,
            "day_of_week": a.day_of_week,
            "time_slots": a.time_slots,
            "is_available": a.is_available,
        }
        for a in user.availabilities
    ]

    profile_out = None
    if user.profile:
        profile_out = {
            "learning_style": user.profile.learning_style,
            "skill_level": user.profile.skill_level,
            "headline": user.profile.headline,
        }

    return {
        "id": user.id,
        "name": user.name,
        "username": user.username or f"student_{user.id}",
        "email": user.email,
        "avatar_url": user.avatar_url,
        "university": user.university or user.college or "UC Berkeley",
        "major": user.major or user.course or "Computer Science",
        "college": user.college or user.university or "UC Berkeley",
        "course": user.course or user.major or "Computer Science",
        "academic_year": user.academic_year or "Junior (3rd Year)",
        "graduation_year": user.graduation_year or 2026,
        "bio": user.bio or "",
        "is_onboarded": user.is_onboarded if user.is_onboarded is not None else True,
        "rating": user.rating,
        "review_count": user.review_count,
        "sessions_completed": user.sessions_completed,
        "xp": user.xp,
        "level": user.level,
        "time_credits": user.time_credits,
        "is_verified": user.is_verified,
        "teaching_skills": teaching,
        "learning_skills": learning,
        "skills": skills_out,
        "profile": profile_out,
        "availabilities": availabilities_out,
        "certificates": certs_out,
        "learning_goals": goals_out,
        "badges": badges_out,
    }

@router.get("/check-username")
def check_username(username: str, db: Session = Depends(get_db)):
    """Check if a username is available in real-time."""
    cleaned = username.strip().lower()
    if len(cleaned) < 3:
        return {"available": False, "message": "Username must be at least 3 characters."}
    if not re.match("^[a-zA-Z0-9_-]+$", cleaned):
        return {"available": False, "message": "Only letters, numbers, hyphens, and underscores allowed."}
    
    existing = db.query(User).filter(User.username.ilike(cleaned)).first()
    return {"available": existing is None}

@router.post("/register")
def register(payload: UserRegister, db: Session = Depends(get_db)):
    # 1. Validation
    name_clean = payload.name.strip()
    if not name_clean:
        raise HTTPException(status_code=400, detail="Full name is required.")

    username_clean = payload.username.strip().lower()
    if len(username_clean) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
    if not re.match("^[a-zA-Z0-9_-]+$", username_clean):
        raise HTTPException(status_code=400, detail="Username can only contain letters, numbers, underscores, and dashes.")

    # Unique username check
    existing_username = db.query(User).filter(User.username.ilike(username_clean)).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username is already taken. Please choose another.")

    # Unique email check
    email_clean = payload.email.strip().lower()
    existing_email = db.query(User).filter(User.email.ilike(email_clean)).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in.")

    # Password validation
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
    if payload.confirm_password and payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    # Hash password securely
    hashed_pwd = hash_password(payload.password)

    # Avatar default
    avatar = payload.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={username_clean}"

    college_val = payload.college or "UC Berkeley"
    course_val = payload.course or "Computer Science"

    new_user = User(
        name=name_clean,
        username=username_clean,
        email=email_clean,
        password_hash=hashed_pwd,
        avatar_url=avatar,
        university=college_val,
        major=course_val,
        college=college_val,
        course=course_val,
        academic_year=payload.academic_year or "Junior (3rd Year)",
        bio=f"Student at {college_val} studying {course_val}.",
        is_onboarded=False, # Must complete multi-step onboarding
        terms_agreed=payload.agree_terms if payload.agree_terms is not None else True,
        rating=5.0,
        review_count=0,
        sessions_completed=0,
        xp=500,
        level=1,
        time_credits=5, # 5 welcome credits
        is_verified=True,
    )
    db.add(new_user)
    db.flush()

    # Create empty profile
    profile = Profile(
        user_id=new_user.id,
        learning_style="One-to-one, Project-based",
        skill_level="Intermediate",
        headline=f"{course_val} student @ {college_val}"
    )
    db.add(profile)
    db.commit()
    db.refresh(new_user)

    # Issue JWT token
    token = create_access_token({"sub": str(new_user.id)})
    return {
        "token": token,
        "user": format_user_profile(new_user),
        "message": "Account created successfully! Welcome bonus: +5 Time Credits awarded!"
    }

@router.post("/login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    ident = payload.email.strip().lower()
    
    # Lookup by email or username
    user = db.query(User).filter(
        or_(User.email.ilike(ident), User.username.ilike(ident))
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password."
        )

    # Verify password with bcrypt
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password."
        )

    # Issue token with configured expiry
    expiry = timedelta(days=30 if payload.remember_me else 7)
    token = create_access_token({"sub": str(user.id)}, expires_delta=expiry)

    return {
        "token": token,
        "user": format_user_profile(user),
        "message": f"Welcome back, {user.name}!"
    }

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(email_clean)).first()
    if not user:
        # Avoid user enumeration by returning standard message
        return {
            "message": "If an account with that email exists, password reset instructions have been sent."
        }
    return {
        "message": f"Password reset instructions have been sent to {email_clean}. Please check your student inbox."
    }

@router.post("/onboarding")
def complete_onboarding(
    payload: OnboardingSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save multi-step onboarding data: teaching skills, learning skills, level, learning styles, availability, and bio."""
    # 1. Update user info
    if payload.bio:
        current_user.bio = payload.bio.strip()
    if payload.avatar_url:
        current_user.avatar_url = payload.avatar_url

    current_user.is_onboarded = True
    current_user.xp += 250 # Award onboarding XP

    # 2. Update Profile
    if not current_user.profile:
        current_user.profile = Profile(user_id=current_user.id)
    
    current_user.profile.skill_level = payload.skill_level or "Intermediate"
    if payload.learning_styles:
        current_user.profile.learning_style = ", ".join(payload.learning_styles)

    # 3. Add or update Teaching Skills
    for s_name in payload.teaching_skills:
        s_name_clean = s_name.strip()
        skill = db.query(Skill).filter(Skill.name.ilike(s_name_clean)).first()
        if not skill:
            skill = Skill(name=s_name_clean, category="Tech", icon="Code", description=f"Student taught {s_name_clean}")
            db.add(skill)
            db.flush()

        existing_us = db.query(UserSkill).filter(
            UserSkill.user_id == current_user.id,
            UserSkill.skill_id == skill.id,
            UserSkill.skill_type == "teach"
        ).first()

        if not existing_us:
            db.add(UserSkill(
                user_id=current_user.id,
                skill_id=skill.id,
                skill_type="teach",
                proficiency=payload.skill_level or "Intermediate",
                endorsements_count=2
            ))

    # 4. Add or update Learning Skills
    for s_name in payload.learning_skills:
        s_name_clean = s_name.strip()
        skill = db.query(Skill).filter(Skill.name.ilike(s_name_clean)).first()
        if not skill:
            skill = Skill(name=s_name_clean, category="Tech", icon="BookOpen", description=f"Student goal {s_name_clean}")
            db.add(skill)
            db.flush()

        existing_us = db.query(UserSkill).filter(
            UserSkill.user_id == current_user.id,
            UserSkill.skill_id == skill.id,
            UserSkill.skill_type == "learn"
        ).first()

        if not existing_us:
            db.add(UserSkill(
                user_id=current_user.id,
                skill_id=skill.id,
                skill_type="learn",
                proficiency="Beginner",
                endorsements_count=0
            ))

    # 5. Save Availability
    # Clear existing availability
    db.query(Availability).filter(Availability.user_id == current_user.id).delete()
    for item in payload.availability:
        day = item.get("day", "")
        slots = item.get("slots", [])
        if day and slots:
            slot_str = ", ".join(slots) if isinstance(slots, list) else str(slots)
            db.add(Availability(
                user_id=current_user.id,
                day_of_week=day,
                time_slots=slot_str,
                is_available=True
            ))

    # 6. Check Quick Learner badge
    quick_learner_badge = db.query(Badge).filter(Badge.name == "Quick Learner").first()
    if quick_learner_badge:
        has_badge = db.query(UserBadge).filter(
            UserBadge.user_id == current_user.id,
            UserBadge.badge_id == quick_learner_badge.id
        ).first()
        if not has_badge:
            db.add(UserBadge(user_id=current_user.id, badge_id=quick_learner_badge.id))

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Onboarding completed successfully! Profile is ready and +250 XP awarded.",
        "user": format_user_profile(current_user)
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Return currently authenticated student profile."""
    return format_user_profile(current_user)

@router.get("/switchable-users")
def get_switchable_users(db: Session = Depends(get_db)):
    """Returns a list of students for 1-click persona switching during testing and demo."""
    users = db.query(User).all()
    results = []
    for u in users:
        teach = [us.skill.name for us in u.skills if us.skill_type == "teach"]
        learn = [us.skill.name for us in u.skills if us.skill_type == "learn"]
        results.append({
            "id": u.id,
            "name": u.name,
            "username": u.username or f"student_{u.id}",
            "email": u.email,
            "avatar_url": u.avatar_url,
            "university": u.university or u.college or "UC Berkeley",
            "major": u.major or u.course or "Computer Science",
            "level": u.level,
            "rating": u.rating,
            "is_onboarded": u.is_onboarded if u.is_onboarded is not None else True,
            "teaching": teach[:2],
            "learning": learn[:2]
        })
    return results
