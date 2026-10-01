from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserSkill, Skill
from ..schemas import UserLogin, UserRegister, UserProfileOut, UserSummary

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
        for ub in user.badges
    ]

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "university": user.university,
        "major": user.major,
        "graduation_year": user.graduation_year,
        "bio": user.bio,
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
        "certificates": certs_out,
        "learning_goals": goals_out,
        "badges": badges_out,
    }

@router.post("/login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Fallback to first user for demo convenience if email not found
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"token": f"token-{user.id}", "user": format_user_profile(user)}

@router.post("/register")
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        return {"token": f"token-{existing.id}", "user": format_user_profile(existing)}

    new_user = User(
        name=payload.name,
        email=payload.email,
        university=payload.university or "UC Berkeley",
        major=payload.major or "Computer Science",
        avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={payload.name.replace(' ', '')}",
        bio=f"Student eager to share and learn skills on SkillSwap!",
        rating=5.0,
        review_count=0,
        sessions_completed=0,
        xp=500,
        level=1,
        time_credits=5,
        is_verified=True,
    )
    db.add(new_user)
    db.flush()

    # Add default skills if provided
    for s_name in (payload.teaching_skills or []):
        sk = db.query(Skill).filter(Skill.name.ilike(f"%{s_name}%")).first()
        if sk:
            db.add(UserSkill(user_id=new_user.id, skill_id=sk.id, skill_type="teach", proficiency="Intermediate", endorsements_count=1))
    
    for s_name in (payload.learning_skills or []):
        sk = db.query(Skill).filter(Skill.name.ilike(f"%{s_name}%")).first()
        if sk:
            db.add(UserSkill(user_id=new_user.id, skill_id=sk.id, skill_type="learn", proficiency="Beginner", endorsements_count=0))

    db.commit()
    db.refresh(new_user)
    return {"token": f"token-{new_user.id}", "user": format_user_profile(new_user)}

@router.get("/me")
def get_current_user(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return format_user_profile(user)

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
            "email": u.email,
            "avatar_url": u.avatar_url,
            "university": u.university,
            "major": u.major,
            "level": u.level,
            "rating": u.rating,
            "teaching": teach[:2],
            "learning": learn[:2]
        })
    return results
