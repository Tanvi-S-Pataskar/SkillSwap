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
    UserProfileOut, UserSummary, ProfileUpdate
)
from ..security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

def format_user_profile(user: User, db: Optional[Session] = None) -> dict:
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
            "related_skill": getattr(c, "related_skill", "") or "",
            "credential_url": c.credential_url or "",
            "credential_id": c.credential_id or "",
            "badge_icon": c.badge_icon or "Award",
            "is_verified": bool(c.is_verified),
            "verification_status": getattr(c, "verification_status", None) or ("Verified" if c.is_verified else "Pending"),
            "file_name": getattr(c, "file_name", "") or "",
            "file_size": getattr(c, "file_size", 0) or 0,
            "mime_type": getattr(c, "mime_type", "") or "",
            "has_file": bool(getattr(c, "file_path", "")),
            "file_url": f"/api/certificates/{c.id}/file" if getattr(c, "file_path", "") else "",
            "created_at": c.created_at.isoformat() if getattr(c, "created_at", None) else "",
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
    learning_styles_list = []
    headline_val = ""
    skill_level_val = "Intermediate"
    if user.profile:
        raw_styles = getattr(user.profile, "learning_style", "") or ""
        learning_styles_list = [s.strip() for s in raw_styles.split(",") if s.strip()]
        headline_val = getattr(user.profile, "headline", "") or ""
        skill_level_val = getattr(user.profile, "skill_level", "") or "Intermediate"
        profile_out = {
            "learning_style": raw_styles,
            "learning_styles": learning_styles_list,
            "skill_level": skill_level_val,
            "headline": headline_val,
        }

    reviews_out = []
    if db is not None:
        from ..models import Review
        reviews = db.query(Review).filter(Review.reviewee_id == user.id).order_by(Review.created_at.desc()).all()
        for r in reviews:
            reviews_out.append({
                "id": r.id,
                "session_id": r.session_id,
                "reviewer_id": r.reviewer_id,
                "reviewer_name": r.reviewer.name if r.reviewer else "Peer Student",
                "reviewer_avatar": r.reviewer.avatar_url if r.reviewer else "",
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at.isoformat() if r.created_at else "",
            })

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
        "headline": headline_val,
        "skill_level": skill_level_val,
        "learning_styles": learning_styles_list,
        "is_onboarded": user.is_onboarded if user.is_onboarded is not None else True,
        "rating": user.rating,
        "review_count": user.review_count,
        "sessions_completed": user.sessions_completed,
        "xp": user.xp,
        "level": user.level,
        "time_credits": user.time_credits,
        "is_verified": bool(user.is_verified),
        "is_admin": bool(getattr(user, "is_admin", False)),
        "teaching_skills": teaching,
        "learning_skills": learning,
        "skills": skills_out,
        "profile": profile_out,
        "availabilities": availabilities_out,
        "availability": availabilities_out,
        "certificates": certs_out,
        "learning_goals": goals_out,
        "badges": badges_out,
        "reviews": reviews_out,
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
    if existing:
        return {"available": False, "message": "Username is already taken. Please choose another."}
    return {"available": True, "message": "Username is available!"}

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
@router.get("/profile")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return currently authenticated student profile."""
    return format_user_profile(current_user, db=db)

@router.put("/profile")
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile information, avatar, bio, academic details, learning styles, and availability. Persists to database."""
    # 1. Username validation & uniqueness
    if payload.username is not None:
        u_clean = payload.username.strip().lower()
        if len(u_clean) < 3:
            raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
        if not re.match("^[a-zA-Z0-9_-]+$", u_clean):
            raise HTTPException(status_code=400, detail="Username can only contain letters, numbers, underscores, and dashes.")
        existing = db.query(User).filter(User.username.ilike(u_clean), User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username is already taken by another student.")
        current_user.username = u_clean

    # 2. Basic student info
    if payload.name is not None:
        name_clean = payload.name.strip()
        if not name_clean:
            raise HTTPException(status_code=400, detail="Full name cannot be empty.")
        current_user.name = name_clean

    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url.strip()

    if payload.bio is not None:
        current_user.bio = payload.bio.strip()

    if payload.university is not None or payload.college is not None:
        val = (payload.university or payload.college or "").strip()
        if val:
            current_user.university = val
            current_user.college = val

    if payload.major is not None or payload.course is not None:
        val = (payload.major or payload.course or "").strip()
        if val:
            current_user.major = val
            current_user.course = val

    if payload.academic_year is not None:
        current_user.academic_year = payload.academic_year.strip()

    if payload.graduation_year is not None:
        current_user.graduation_year = payload.graduation_year

    # 3. Profile details (headline, learning_style, skill_level)
    if not current_user.profile:
        current_user.profile = Profile(user_id=current_user.id)

    if payload.headline is not None:
        current_user.profile.headline = payload.headline.strip()

    if payload.learning_style is not None:
        current_user.profile.learning_style = payload.learning_style.strip()

    if payload.skill_level is not None:
        current_user.profile.skill_level = payload.skill_level.strip()

    # 4. Weekly Availability
    if payload.availability is not None:
        db.query(Availability).filter(Availability.user_id == current_user.id).delete()
        for item in payload.availability:
            day = item.get("day", "") or item.get("day_of_week", "")
            slots = item.get("slots", []) or item.get("time_slots", "")
            if day and slots:
                slot_str = ", ".join(slots) if isinstance(slots, list) else str(slots)
                db.add(Availability(
                    user_id=current_user.id,
                    day_of_week=day,
                    time_slots=slot_str,
                    is_available=True
                ))

    # 5. Teaching skills
    if payload.teaching_skills is not None:
        db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_type == "teach").delete()
        for item in payload.teaching_skills:
            s_name = item.get("name") if isinstance(item, dict) else str(item)
            s_prof = item.get("proficiency", "Intermediate") if isinstance(item, dict) else "Intermediate"
            s_clean = s_name.strip()
            if s_clean:
                skill = db.query(Skill).filter(Skill.name.ilike(s_clean)).first()
                if not skill:
                    skill = Skill(name=s_clean, category="Tech", icon="Code", description=f"Student taught {s_clean}")
                    db.add(skill)
                    db.flush()
                db.add(UserSkill(
                    user_id=current_user.id,
                    skill_id=skill.id,
                    skill_type="teach",
                    proficiency=s_prof,
                    endorsements_count=item.get("endorsements_count", 0) if isinstance(item, dict) else 0
                ))

    # 6. Learning skills
    if payload.learning_skills is not None:
        db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_type == "learn").delete()
        for item in payload.learning_skills:
            s_name = item.get("name") if isinstance(item, dict) else str(item)
            s_prof = item.get("proficiency", "Beginner") if isinstance(item, dict) else "Beginner"
            s_clean = s_name.strip()
            if s_clean:
                skill = db.query(Skill).filter(Skill.name.ilike(s_clean)).first()
                if not skill:
                    skill = Skill(name=s_clean, category="Tech", icon="BookOpen", description=f"Student goal {s_clean}")
                    db.add(skill)
                    db.flush()
                db.add(UserSkill(
                    user_id=current_user.id,
                    skill_id=skill.id,
                    skill_type="learn",
                    proficiency=s_prof,
                    endorsements_count=0
                ))

    db.commit()
    db.refresh(current_user)
    return {
        "message": "Student profile updated successfully!",
        "user": format_user_profile(current_user, db=db)
    }

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
