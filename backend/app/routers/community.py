from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database import get_db
from ..models import Project, LearningGoal, Badge, User, Notification
from ..schemas import ProjectCreate, LearningGoalCreate

router = APIRouter(prefix="/community", tags=["community"])

@router.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(desc(Project.created_at)).all()
    results = []
    for p in projects:
        results.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "skills_needed": p.skills_needed.split(", ") if p.skills_needed else [],
            "team_size": p.team_size,
            "status": p.status,
            "github_url": p.github_url,
            "creator_id": p.creator_id,
            "creator_name": p.creator.name if p.creator else "Student Innovator",
            "creator_avatar": p.creator.avatar_url if p.creator else "",
            "creator_university": p.creator.university if p.creator else "University",
        })
    return results

@router.post("/projects")
def create_project(payload: ProjectCreate, creator_id: int = 1, db: Session = Depends(get_db)):
    proj = Project(
        creator_id=creator_id,
        title=payload.title,
        description=payload.description,
        skills_needed=payload.skills_needed,
        team_size=payload.team_size or 3,
        status="open",
        github_url=payload.github_url or ""
    )
    db.add(proj)

    # Award XP for initiating a project
    user = db.query(User).filter(User.id == creator_id).first()
    if user:
        user.xp += 150

    db.commit()
    db.refresh(proj)
    return {"message": "Project posted to student community!", "id": proj.id}

@router.get("/goals")
def list_goals(user_id: int = 1, db: Session = Depends(get_db)):
    goals = db.query(LearningGoal).filter(LearningGoal.user_id == user_id).all()
    return [
        {
            "id": g.id,
            "title": g.title,
            "target_date": g.target_date,
            "progress_pct": g.progress_pct,
            "status": g.status,
        }
        for g in goals
    ]

@router.post("/goals")
def add_goal(payload: LearningGoalCreate, user_id: int = 1, db: Session = Depends(get_db)):
    goal = LearningGoal(
        user_id=user_id,
        title=payload.title,
        target_date=payload.target_date,
        progress_pct=payload.progress_pct or 0,
        status="in_progress"
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return {"message": "Learning goal created!", "id": goal.id}

@router.put("/goals/{goal_id}/progress")
def update_goal_progress(goal_id: int, progress: int, user_id: int = 1, db: Session = Depends(get_db)):
    g = db.query(LearningGoal).filter(LearningGoal.id == goal_id, LearningGoal.user_id == user_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    g.progress_pct = max(0, min(100, progress))
    if g.progress_pct == 100:
        g.status = "completed"
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.xp += 200
    db.commit()
    return {"message": "Goal updated!"}

@router.get("/badges")
def list_badges(db: Session = Depends(get_db)):
    badges = db.query(Badge).all()
    return [
        {
            "id": b.id,
            "name": b.name,
            "description": b.description,
            "icon": b.icon,
            "category": b.category,
            "xp_value": b.xp_value,
        }
        for b in badges
    ]

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).order_by(desc(User.xp)).limit(10).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "avatar_url": u.avatar_url,
            "university": u.university,
            "major": u.major,
            "xp": u.xp,
            "level": u.level,
            "sessions_completed": u.sessions_completed,
            "rating": u.rating
        }
        for u in users
    ]

@router.get("/notifications")
def list_notifications(user_id: int = 1, db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(Notification.user_id == user_id).order_by(desc(Notification.created_at)).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at.strftime("%b %d, %I:%M %p") if n.created_at else ""
        }
        for n in notifs
    ]
