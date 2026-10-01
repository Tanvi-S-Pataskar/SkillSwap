from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..models import Session as SessionModel, User, Skill, Review, Notification
from ..schemas import SessionCreate, ReviewCreate

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.get("")
def list_sessions(user_id: int = 1, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(SessionModel).filter(
        or_(SessionModel.learner_id == user_id, SessionModel.teacher_id == user_id)
    )

    if status and status.lower() != "all":
        query = query.filter(SessionModel.status == status)

    sessions = query.order_by(desc(SessionModel.created_at)).all()
    results = []

    for s in sessions:
        rev_data = None
        if s.review:
            rev_data = {
                "id": s.review.id,
                "session_id": s.review.session_id,
                "reviewer_id": s.review.reviewer_id,
                "reviewer_name": s.review.reviewer.name if s.review.reviewer else "Peer",
                "reviewer_avatar": s.review.reviewer.avatar_url if s.review.reviewer else "",
                "rating": s.review.rating,
                "comment": s.review.comment,
                "created_at": s.review.created_at.isoformat() if s.review.created_at else ""
            }

        results.append({
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "scheduled_at": s.scheduled_at,
            "duration_minutes": s.duration_minutes,
            "status": s.status,
            "meeting_link": s.meeting_link,
            "notes": s.notes,
            "skill_id": s.skill_id,
            "skill_name": s.skill.name if s.skill else "General Mentorship",
            "learner_id": s.learner_id,
            "learner_name": s.learner.name if s.learner else "Student Learner",
            "learner_avatar": s.learner.avatar_url if s.learner else "",
            "teacher_id": s.teacher_id,
            "teacher_name": s.teacher.name if s.teacher else "Student Mentor",
            "teacher_avatar": s.teacher.avatar_url if s.teacher else "",
            "is_teacher": s.teacher_id == user_id,
            "review": rev_data,
        })

    return results

@router.post("")
def create_session(payload: SessionCreate, learner_id: int = 1, db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == payload.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    skill = db.query(Skill).filter(Skill.id == payload.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    new_session = SessionModel(
        learner_id=learner_id,
        teacher_id=payload.teacher_id,
        skill_id=payload.skill_id,
        title=payload.title,
        description=payload.description or f"Skill swap session on {skill.name}",
        scheduled_at=payload.scheduled_at,
        duration_minutes=payload.duration_minutes or 60,
        status="confirmed",
        meeting_link=f"https://meet.skillswap.edu/room-{learner_id}-{payload.teacher_id}-{skill.id}",
        notes=payload.notes or "Join via link at scheduled time."
    )
    db.add(new_session)

    # Notify teacher
    learner = db.query(User).filter(User.id == learner_id).first()
    learner_name = learner.name if learner else "A student"
    notif = Notification(
        user_id=payload.teacher_id,
        title="New Skill Swap Session!",
        message=f"{learner_name} booked a session with you on {skill.name} for {payload.scheduled_at}.",
        type="session"
    )
    db.add(notif)
    db.commit()
    db.refresh(new_session)

    return {"message": "Session booked successfully!", "session_id": new_session.id}

@router.put("/{session_id}/complete")
def complete_session(session_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    sess = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")

    sess.status = "completed"
    
    # Award XP to both participants
    if sess.teacher:
        sess.teacher.xp += 150
        sess.teacher.sessions_completed += 1
        sess.teacher.time_credits += 1
    if sess.learner:
        sess.learner.xp += 100
        sess.learner.sessions_completed += 1

    db.commit()
    return {"message": "Session marked as completed! XP awarded."}

@router.post("/review")
def submit_review(payload: ReviewCreate, reviewer_id: int = 1, db: Session = Depends(get_db)):
    sess = db.query(SessionModel).filter(SessionModel.id == payload.session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")

    existing = db.query(Review).filter(Review.session_id == payload.session_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already submitted for this session")

    # Determine reviewee (if reviewer is learner, reviewee is teacher)
    reviewee_id = sess.teacher_id if sess.learner_id == reviewer_id else sess.learner_id

    rev = Review(
        session_id=payload.session_id,
        reviewer_id=reviewer_id,
        reviewee_id=reviewee_id,
        rating=payload.rating,
        comment=payload.comment
    )
    db.add(rev)

    # Recalculate reviewee average rating
    reviewee = db.query(User).filter(User.id == reviewee_id).first()
    if reviewee:
        all_revs = db.query(Review).filter(Review.reviewee_id == reviewee_id).all()
        ratings = [r.rating for r in all_revs] + [payload.rating]
        reviewee.rating = round(sum(ratings) / len(ratings), 2)
        reviewee.review_count = len(ratings)
        reviewee.xp += 50

    db.commit()
    return {"message": "Review submitted successfully!"}
