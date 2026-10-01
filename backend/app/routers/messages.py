from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from datetime import datetime
from ..database import get_db
from ..models import Message, User
from ..schemas import MessageCreate

router = APIRouter(prefix="/messages", tags=["messages"])

@router.get("/conversations")
def list_conversations(user_id: int = 1, db: Session = Depends(get_db)):
    """List distinct students that current user has chatted with."""
    msgs = db.query(Message).filter(
        or_(Message.sender_id == user_id, Message.receiver_id == user_id)
    ).order_by(desc(Message.created_at)).all()

    partner_ids = []
    threads = {}
    for m in msgs:
        partner_id = m.receiver_id if m.sender_id == user_id else m.sender_id
        if partner_id not in threads:
            partner = db.query(User).filter(User.id == partner_id).first()
            if partner:
                threads[partner_id] = {
                    "partner_id": partner.id,
                    "partner_name": partner.name,
                    "partner_avatar": partner.avatar_url,
                    "partner_university": partner.university,
                    "last_message": m.content,
                    "last_message_time": m.created_at.strftime("%I:%M %p") if m.created_at else "",
                    "unread": not m.is_read and m.receiver_id == user_id,
                }
    
    # If no conversations yet, default with Liam Vance
    if not threads:
        liam = db.query(User).filter(User.id == 2).first()
        if liam:
            threads[liam.id] = {
                "partner_id": liam.id,
                "partner_name": liam.name,
                "partner_avatar": liam.avatar_url,
                "partner_university": liam.university,
                "last_message": "Hey! Looking forward to our swap session.",
                "last_message_time": "10:30 AM",
                "unread": False
            }

    return list(threads.values())

@router.get("/thread/{partner_id}")
def get_thread(partner_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    msgs = db.query(Message).filter(
        or_(
            and_(Message.sender_id == user_id, Message.receiver_id == partner_id),
            and_(Message.sender_id == partner_id, Message.receiver_id == user_id),
        )
    ).order_by(Message.created_at).all()

    # Mark as read
    for m in msgs:
        if m.receiver_id == user_id:
            m.is_read = True
    db.commit()

    results = []
    for m in msgs:
        results.append({
            "id": m.id,
            "sender_id": m.sender_id,
            "receiver_id": m.receiver_id,
            "content": m.content,
            "is_mine": m.sender_id == user_id,
            "timestamp": m.created_at.strftime("%I:%M %p") if m.created_at else "Just now"
        })

    partner = db.query(User).filter(User.id == partner_id).first()
    return {
        "partner": {
            "id": partner.id if partner else partner_id,
            "name": partner.name if partner else "Student",
            "avatar_url": partner.avatar_url if partner else "",
            "university": partner.university if partner else ""
        },
        "messages": results
    }

@router.post("")
def send_message(payload: MessageCreate, user_id: int = 1, db: Session = Depends(get_db)):
    msg = Message(
        sender_id=user_id,
        receiver_id=payload.receiver_id,
        content=payload.content,
        is_read=False
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "is_mine": True,
        "timestamp": msg.created_at.strftime("%I:%M %p")
    }
