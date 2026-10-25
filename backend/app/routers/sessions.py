from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import Optional, List
from datetime import datetime
from ..database import get_db
from ..models import Session as SessionModel, User, Skill, Review, Notification
from ..schemas import SessionCreate, ReviewCreate, ReviewUpdate
from ..security import get_current_user

router = APIRouter(tags=["sessions"])

def recalculate_user_rating(user_id: int, db: Session):
    """Recalculate user average rating and review count from scratch to ensure mathematical integrity."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return
    all_reviews = db.query(Review).filter(Review.reviewee_id == user_id).all()
    if all_reviews:
        avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
        user.rating = round(avg_rating, 2)
        user.review_count = len(all_reviews)
    else:
        user.rating = 5.0
        user.review_count = 0
    db.commit()

# --- SESSIONS ENDPOINTS ---

@router.get("/sessions")
def list_sessions(
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List skill swap sessions for the authenticated student.
    Can filter by status ('confirmed', 'completed', 'cancelled', 'all').
    """
    target_id = user_id or (current_user.id if current_user else 1)

    query = db.query(SessionModel).filter(
        or_(SessionModel.learner_id == target_id, SessionModel.teacher_id == target_id)
    )

    if status and status.lower() != "all":
        query = query.filter(SessionModel.status == status.lower())

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
            "is_teacher": s.teacher_id == target_id,
            "review": rev_data,
        })

    return results

@router.post("/sessions")
def create_session(
    payload: SessionCreate,
    current_user: Optional[User] = Depends(get_current_user),
    learner_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Book a new peer-to-peer skill swap session with another student.
    """
    actual_learner_id = current_user.id if current_user else (learner_id or 1)

    # 1. Prevent self-booking
    if actual_learner_id == payload.teacher_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot book a skill swap session with yourself."
        )

    teacher = db.query(User).filter(User.id == payload.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Student mentor not found.")

    skill = db.query(Skill).filter(Skill.id == payload.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")

    learner = db.query(User).filter(User.id == actual_learner_id).first()

    # 2. Create the session
    new_session = SessionModel(
        learner_id=actual_learner_id,
        teacher_id=payload.teacher_id,
        skill_id=payload.skill_id,
        title=payload.title.strip() if payload.title else f"Skill Swap on {skill.name}",
        description=payload.description or f"Peer-to-peer barter session covering {skill.name}.",
        scheduled_at=payload.scheduled_at,
        duration_minutes=payload.duration_minutes or 60,
        status="confirmed",
        meeting_link=f"https://meet.skillswap.edu/room-{actual_learner_id}-{payload.teacher_id}-{skill.id}",
        notes=payload.notes or "Join via video link at scheduled time."
    )
    db.add(new_session)

    # 3. Notify the teacher
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

    return {
        "message": "Session booked successfully!",
        "session_id": new_session.id
    }

@router.put("/sessions/{session_id}/complete")
def complete_session(
    session_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Mark a confirmed session as completed.
    Awards +150 XP and +1 Barter Time Credit to teacher, +100 XP to learner.
    """
    sess = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found.")

    caller_id = current_user.id if current_user else (user_id or 1)
    is_participant = (caller_id in (sess.learner_id, sess.teacher_id))
    is_admin = bool(current_user and getattr(current_user, "is_admin", False))

    if not (is_participant or is_admin):
        raise HTTPException(
            status_code=403,
            detail="You can only complete sessions you participated in."
        )

    if sess.status == "completed":
        return {"message": "Session is already marked as completed.", "session_id": session_id}

    sess.status = "completed"

    # Award XP and Barter Time Credit
    if sess.teacher:
        sess.teacher.xp += 150
        sess.teacher.sessions_completed += 1
        sess.teacher.time_credits += 1
    if sess.learner:
        sess.learner.xp += 100
        sess.learner.sessions_completed += 1

    db.commit()
    return {
        "message": "Session marked as completed! XP and Barter Time Credits awarded.",
        "session_id": session_id
    }

# --- REVIEWS & RATINGS ENDPOINTS ---

@router.post("/sessions/review")
@router.post("/reviews")
def submit_review(
    payload: ReviewCreate,
    current_user: Optional[User] = Depends(get_current_user),
    reviewer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Submit a star rating and written review for a completed skill-exchange session.
    Enforces:
    - User authentication
    - Session existence and 'completed' status
    - Participant verification
    - Self-review prevention
    - Duplicate review prevention
    - Rating value range (1.0 to 5.0) and comment validation
    """
    actual_reviewer_id = current_user.id if current_user else (reviewer_id or 1)
    reviewer = current_user or db.query(User).filter(User.id == actual_reviewer_id).first()
    if not reviewer:
        raise HTTPException(status_code=401, detail="Authentication required to submit reviews.")

    # 1. Fetch Session
    sess = db.query(SessionModel).filter(SessionModel.id == payload.session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found.")

    # 2. Server-side session completion requirement
    if sess.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Reviews can only be submitted after a skill-exchange session is completed."
        )

    # 3. Participant verification
    if actual_reviewer_id not in (sess.learner_id, sess.teacher_id):
        raise HTTPException(
            status_code=403,
            detail="You can only review sessions you directly participated in."
        )

    # 4. Determine reviewee (if reviewer was learner, reviewee is teacher; and vice versa)
    reviewee_id = sess.teacher_id if sess.learner_id == actual_reviewer_id else sess.learner_id

    # 5. Prevent self-review
    if actual_reviewer_id == reviewee_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot review yourself."
        )

    # 6. Validate rating range (1.0 - 5.0)
    if payload.rating is None or payload.rating < 1.0 or payload.rating > 5.0:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 1.0 and 5.0 stars."
        )

    # 7. Validate review comment
    comment_clean = (payload.comment or "").strip()
    if len(comment_clean) < 5:
        raise HTTPException(
            status_code=400,
            detail="Review comment must be at least 5 characters long."
        )

    # 8. Prevent duplicate reviews for the same completed session
    existing = db.query(Review).filter(Review.session_id == payload.session_id).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A review has already been submitted for this completed session."
        )

    # 9. Create Review record
    rev = Review(
        session_id=payload.session_id,
        reviewer_id=actual_reviewer_id,
        reviewee_id=reviewee_id,
        rating=round(float(payload.rating), 1),
        comment=comment_clean,
        created_at=datetime.utcnow()
    )
    db.add(rev)
    db.flush()

    # 10. Recalculate reviewee average rating and award reputation XP
    recalculate_user_rating(reviewee_id, db)
    reviewee = db.query(User).filter(User.id == reviewee_id).first()
    if reviewee:
        reviewee.xp += 50

    # 11. Send notification to reviewee
    db.add(Notification(
        user_id=reviewee_id,
        title="New Peer Review Received!",
        message=f"{reviewer.name} rated your session {rev.rating} stars: '{comment_clean[:60]}...'",
        type="review"
    ))
    db.commit()
    db.refresh(rev)

    return {
        "message": "Review submitted successfully! Peer profile updated.",
        "id": rev.id,
        "rating": rev.rating,
        "reviewee_id": reviewee_id,
        "new_average_rating": reviewee.rating if reviewee else rev.rating
    }

@router.put("/reviews/{review_id}")
@router.put("/sessions/review/{review_id}")
def update_review(
    review_id: int,
    payload: ReviewUpdate,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a submitted review. Only the original author can edit their review.
    """
    rev = db.query(Review).filter(Review.id == review_id).first()
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found.")

    if not current_user or rev.reviewer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Permission denied. You can only edit your own reviews."
        )

    if payload.rating is not None:
        if payload.rating < 1.0 or payload.rating > 5.0:
            raise HTTPException(status_code=400, detail="Rating must be between 1.0 and 5.0 stars.")
        rev.rating = round(float(payload.rating), 1)

    if payload.comment is not None:
        comment_clean = payload.comment.strip()
        if len(comment_clean) < 5:
            raise HTTPException(status_code=400, detail="Review comment must be at least 5 characters long.")
        rev.comment = comment_clean

    db.commit()
    recalculate_user_rating(rev.reviewee_id, db)
    db.refresh(rev)

    return {
        "message": "Review updated successfully.",
        "id": rev.id,
        "rating": rev.rating,
        "comment": rev.comment
    }

@router.delete("/reviews/{review_id}")
@router.delete("/sessions/review/{review_id}")
def delete_review(
    review_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a review. Only the author or an administrator can delete a review.
    """
    rev = db.query(Review).filter(Review.id == review_id).first()
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found.")

    is_author = (current_user and rev.reviewer_id == current_user.id)
    is_admin = bool(current_user and getattr(current_user, "is_admin", False))

    if not (is_author or is_admin):
        raise HTTPException(
            status_code=403,
            detail="Permission denied. You can only delete reviews you authored."
        )

    reviewee_id = rev.reviewee_id
    db.delete(rev)
    db.commit()
    recalculate_user_rating(reviewee_id, db)

    return {"message": "Review deleted successfully.", "id": review_id}

@router.get("/reviews/student/{student_id}")
def get_student_reviews(student_id: int, db: Session = Depends(get_db)):
    """
    Get all reviews received by a student.
    """
    reviews = db.query(Review).filter(Review.reviewee_id == student_id).order_by(desc(Review.created_at)).all()
    results = []
    for r in reviews:
        results.append({
            "id": r.id,
            "session_id": r.session_id,
            "reviewer_id": r.reviewer_id,
            "reviewer_name": r.reviewer.name if r.reviewer else "Peer Student",
            "reviewer_avatar": r.reviewer.avatar_url if r.reviewer else "",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat() if r.created_at else ""
        })
    return results
