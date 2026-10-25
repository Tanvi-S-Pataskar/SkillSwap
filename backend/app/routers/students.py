from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import Optional, List
from ..database import get_db
from ..models import User, UserSkill, Skill, Review, Session as SessionModel, Profile, Availability
from ..security import get_current_user
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

@router.get("/matches")
def get_skill_matches(
    q: Optional[str] = None,
    mode: Optional[str] = "all", # "all", "perfect", "can_teach_me", "wants_to_learn"
    skill_level: Optional[str] = None, # "Beginner", "Intermediate", "Advanced", "Expert"
    learning_style: Optional[str] = None, # "One-to-one", "Project-based", etc.
    availability_day: Optional[str] = None, # "Monday", "Tuesday", etc.
    user_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Smart skill discovery and matching engine based on database records.
    Finds complementary peer-swap matches:
    - Perfect 2-way swaps (They teach what you want to learn, and they want to learn what you teach)
    - 1-way matches (They can teach you, or they want what you teach)
    Supports search by student name/username/skill, and filtering by skill level, learning style, and availability.
    """
    target_id = user_id or (current_user.id if current_user else 1)
    me = db.query(User).filter(User.id == target_id).first()
    if not me:
        target_id = 1
        me = db.query(User).filter(User.id == 1).first()

    my_teach_skills = [
        {"id": us.skill.id, "name": us.skill.name.strip(), "proficiency": us.proficiency}
        for us in me.skills if us.skill_type == "teach" and us.skill
    ] if me else []

    my_learn_skills = [
        {"id": us.skill.id, "name": us.skill.name.strip(), "proficiency": us.proficiency}
        for us in me.skills if us.skill_type == "learn" and us.skill
    ] if me else []

    def normalize_skill(name: str) -> str:
        return name.lower().strip()

    def skill_matches(s1: str, s2: str) -> bool:
        n1, n2 = normalize_skill(s1), normalize_skill(s2)
        return (n1 == n2) or (n1 in n2) or (n2 in n1)

    candidates = db.query(User).filter(User.id != target_id).all()
    results = []

    for st in candidates:
        st_teach = [
            {
                "id": us.skill.id,
                "name": us.skill.name,
                "category": us.skill.category,
                "icon": us.skill.icon,
                "proficiency": us.proficiency,
                "endorsements_count": us.endorsements_count or 0
            }
            for us in st.skills if us.skill_type == "teach" and us.skill
        ]
        st_learn = [
            {
                "id": us.skill.id,
                "name": us.skill.name,
                "category": us.skill.category,
                "icon": us.skill.icon,
                "proficiency": us.proficiency
            }
            for us in st.skills if us.skill_type == "learn" and us.skill
        ]

        can_teach_me = []
        for sk in st_teach:
            if any(skill_matches(sk["name"], ml["name"]) for ml in my_learn_skills):
                can_teach_me.append(sk["name"])

        wants_from_me = []
        for sk in st_learn:
            if any(skill_matches(sk["name"], mt["name"]) for mt in my_teach_skills):
                wants_from_me.append(sk["name"])

        is_perfect = bool(len(can_teach_me) > 0 and len(wants_from_me) > 0)

        # Classify match type
        if is_perfect:
            match_type = "perfect"
        elif len(can_teach_me) > 0:
            match_type = "can_teach_you"
        elif len(wants_from_me) > 0:
            match_type = "wants_to_learn"
        else:
            match_type = "shared_interest"

        # Match score calculation
        score = 55
        if is_perfect:
            score = 90 + min(9, len(can_teach_me) * 3 + len(wants_from_me) * 3)
        elif len(can_teach_me) > 0:
            score = 75 + min(13, len(can_teach_me) * 5)
        elif len(wants_from_me) > 0:
            score = 70 + min(12, len(wants_from_me) * 4)

        if me and st.university and me.university and st.university.lower() == me.university.lower():
            score = min(99, score + 4)

        # Match explanation
        if is_perfect:
            match_reason = f"Perfect 2-Way Barter! They teach {can_teach_me[0]} which you want to learn, and they want to learn {wants_from_me[0]} which you teach."
        elif len(can_teach_me) > 0:
            match_reason = f"They teach {', '.join(can_teach_me[:2])} which matches your learning wishlist."
        elif len(wants_from_me) > 0:
            match_reason = f"They want to learn {', '.join(wants_from_me[:2])} which matches skills you teach."
        else:
            match_reason = f"Campus peer at {st.university or st.college} studying {st.major or st.course} with complementary swap availability."

        # Learning styles
        styles_list = []
        if st.profile and st.profile.learning_style:
            styles_list = [s.strip() for s in st.profile.learning_style.split(",") if s.strip()]

        # Availabilities
        avail_list = [
            {"day": a.day_of_week, "slots": a.time_slots}
            for a in st.availabilities if a.is_available
        ]

        # Filter by search query (name, username, major, university, bio, or skills)
        if q:
            q_clean = q.strip().lower()
            q_term = q_clean[1:] if q_clean.startswith("@") else q_clean
            all_skill_names = [s["name"].lower() for s in st_teach + st_learn]
            match_q = (
                q_term in st.name.lower() or
                (st.username and q_term in st.username.lower()) or
                (st.major and q_term in st.major.lower()) or
                (st.university and q_term in st.university.lower()) or
                (st.bio and q_term in st.bio.lower()) or
                any(q_term in s for s in all_skill_names)
            )
            if not match_q:
                continue

        # Filter by mode
        if mode and mode != "all":
            if mode == "perfect" and not is_perfect:
                continue
            elif mode == "can_teach_me" and len(can_teach_me) == 0:
                continue
            elif mode == "wants_to_learn" and len(wants_from_me) == 0:
                continue

        # Filter by skill level
        if skill_level and skill_level.lower() != "all":
            if not any(s["proficiency"].lower() == skill_level.lower() for s in st_teach):
                continue

        # Filter by learning style
        if learning_style and learning_style.lower() != "all":
            if not any(learning_style.lower() in s.lower() for s in styles_list):
                continue

        # Filter by availability day
        if availability_day and availability_day.lower() != "all":
            if not any(availability_day.lower() in a["day"].lower() for a in avail_list):
                continue

        results.append({
            "id": st.id,
            "name": st.name,
            "username": st.username or f"student_{st.id}",
            "avatar_url": st.avatar_url,
            "university": st.university or st.college or "UC Berkeley",
            "major": st.major or st.course or "Computer Science",
            "college": st.college or st.university or "UC Berkeley",
            "course": st.course or st.major or "Computer Science",
            "academic_year": st.academic_year or "Junior (3rd Year)",
            "graduation_year": st.graduation_year or 2026,
            "bio": st.bio or "",
            "rating": st.rating,
            "review_count": st.review_count,
            "sessions_completed": st.sessions_completed,
            "xp": st.xp,
            "level": st.level,
            "time_credits": st.time_credits,
            "is_verified": bool(st.is_verified),
            "match_score": score,
            "match_type": match_type,
            "match_reason": match_reason,
            "is_perfect_match": is_perfect,
            "can_teach_you": can_teach_me,
            "wants_from_you": wants_from_me,
            "teaching_skills": st_teach,
            "learning_skills": st_learn,
            "learning_styles": styles_list,
            "availabilities": avail_list,
        })

    # Sort results: perfect matches first, then match_score desc, then rating desc
    results.sort(key=lambda x: (x["is_perfect_match"], x["match_score"], x["rating"]), reverse=True)
    return results

@router.get("/{student_id}")
def get_student_detail(student_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == student_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")

    profile = format_user_profile(user, db=db)

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
