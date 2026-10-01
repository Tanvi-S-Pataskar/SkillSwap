from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import Optional, List
from ..database import get_db
from ..models import User, UserSkill, Skill, Review, Session as SessionModel
from .auth import format_user_profile

router = APIRouter(prefix="/students", tags=["students"])

@router.get("")
def list_students(
    q: Optional[str] = None,
    skill: Optional[str] = None,
    category: Optional[str] = None,
    university: Optional[str] = None,
    sort_by: Optional[str] = "rating", # rating, xp, sessions
    db: Session = Depends(get_db)
):
    query = db.query(User)

    if q:
        query = query.filter(
            or_(
                User.name.ilike(f"%{q}%"),
                User.university.ilike(f"%{q}%"),
                User.major.ilike(f"%{q}%"),
                User.bio.ilike(f"%{q}%")
            )
        )

    if university:
        query = query.filter(User.university.ilike(f"%{university}%"))

    if sort_by == "xp":
        query = query.order_by(desc(User.xp))
    elif sort_by == "sessions":
        query = query.order_by(desc(User.sessions_completed))
    else:
        query = query.order_by(desc(User.rating), desc(User.review_count))

    users = query.all()
    results = []

    for u in users:
        teach = [us.skill.name for us in u.skills if us.skill_type == "teach"]
        learn = [us.skill.name for us in u.skills if us.skill_type == "learn"]
        skill_cats = [us.skill.category for us in u.skills]

        # Skill filter
        if skill and not any(skill.lower() in s.lower() for s in teach + learn):
            continue

        # Category filter
        if category and not any(category.lower() == c.lower() for c in skill_cats):
            continue

        results.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "avatar_url": u.avatar_url,
            "university": u.university,
            "major": u.major,
            "graduation_year": u.graduation_year,
            "bio": u.bio,
            "rating": u.rating,
            "review_count": u.review_count,
            "sessions_completed": u.sessions_completed,
            "xp": u.xp,
            "level": u.level,
            "time_credits": u.time_credits,
            "is_verified": u.is_verified,
            "teaching_skills": teach,
            "learning_skills": learn,
        })

    return results

@router.get("/featured")
def get_featured_students(limit: int = 6, db: Session = Depends(get_db)):
    users = db.query(User).order_by(desc(User.rating), desc(User.sessions_completed)).limit(limit).all()
    results = []
    for u in users:
        teach = [us.skill.name for us in u.skills if us.skill_type == "teach"]
        learn = [us.skill.name for us in u.skills if us.skill_type == "learn"]
        results.append({
            "id": u.id,
            "name": u.name,
            "avatar_url": u.avatar_url,
            "university": u.university,
            "major": u.major,
            "rating": u.rating,
            "review_count": u.review_count,
            "sessions_completed": u.sessions_completed,
            "xp": u.xp,
            "level": u.level,
            "is_verified": u.is_verified,
            "teaching_skills": teach[:3],
            "learning_skills": learn[:2],
            "bio": u.bio[:120] + "..." if len(u.bio) > 120 else u.bio
        })
    return results

@router.get("/{student_id}")
def get_student_detail(student_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == student_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")

    profile = format_user_profile(user)

    # Fetch recent reviews where this student was the teacher or reviewee
    reviews = db.query(Review).filter(Review.reviewee_id == student_id).order_by(desc(Review.created_at)).all()
    reviews_data = []
    for r in reviews:
        reviews_data.append({
            "id": r.id,
            "session_id": r.session_id,
            "reviewer_id": r.reviewer_id,
            "reviewer_name": r.reviewer.name if r.reviewer else "Anonymous Peer",
            "reviewer_avatar": r.reviewer.avatar_url if r.reviewer else "",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat() if r.created_at else ""
        })

    profile["reviews"] = reviews_data
    return profile
