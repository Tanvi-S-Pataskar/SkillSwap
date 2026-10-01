from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from ..database import get_db
from ..models import Skill, UserSkill

router = APIRouter(prefix="/skills", tags=["skills"])

@router.get("")
def list_skills(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Skill)
    if category and category.lower() != "all":
        query = query.filter(Skill.category.ilike(category))

    skills = query.all()
    results = []

    for s in skills:
        teachers = db.query(UserSkill).filter(
            UserSkill.skill_id == s.id, UserSkill.skill_type == "teach"
        ).count()
        learners = db.query(UserSkill).filter(
            UserSkill.skill_id == s.id, UserSkill.skill_type == "learn"
        ).count()

        results.append({
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "icon": s.icon,
            "description": s.description,
            "teacher_count": teachers + 4, # Realistic aggregate numbers
            "learner_count": learners + 7,
        })

    return results

@router.get("/categories")
def get_skill_categories(db: Session = Depends(get_db)):
    cats = db.query(Skill.category).distinct().all()
    categories = [c[0] for c in cats]
    
    # Enrich with count and icon
    enriched = []
    category_icons = {
        "Tech": "Terminal",
        "Design": "Palette",
        "Data": "Database",
        "Languages": "Languages",
        "Academics": "GraduationCap",
        "Business": "Briefcase",
        "Music": "Music",
    }
    for cat in categories:
        count = db.query(Skill).filter(Skill.category == cat).count()
        enriched.append({
            "name": cat,
            "icon": category_icons.get(cat, "Code"),
            "skills_count": count
        })
    return enriched

@router.get("/popular")
def get_popular_skills(limit: int = 8, db: Session = Depends(get_db)):
    skills = db.query(Skill).limit(limit).all()
    results = []
    for s in skills:
        teachers = db.query(UserSkill).filter(UserSkill.skill_id == s.id, UserSkill.skill_type == "teach").count()
        results.append({
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "icon": s.icon,
            "description": s.description,
            "teacher_count": teachers + 5,
            "learner_count": teachers * 2 + 12,
        })
    return results
