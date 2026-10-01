from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Certificate, User
from ..schemas import CertificateCreate

router = APIRouter(prefix="/certificates", tags=["certificates"])

@router.get("")
def list_certificates(user_id: int = 1, db: Session = Depends(get_db)):
    certs = db.query(Certificate).filter(Certificate.user_id == user_id).all()
    return [
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
        for c in certs
    ]

@router.post("")
def add_certificate(payload: CertificateCreate, user_id: int = 1, db: Session = Depends(get_db)):
    cert = Certificate(
        user_id=user_id,
        title=payload.title,
        issuer=payload.issuer,
        issue_date=payload.issue_date,
        credential_url=payload.credential_url or "",
        credential_id=payload.credential_id or "",
        badge_icon=payload.badge_icon or "Award",
        is_verified=True # Auto-verified for student demo
    )
    db.add(cert)
    # Give user XP for adding credentials
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.xp += 100

    db.commit()
    db.refresh(cert)
    return {"message": "Certificate added to student profile!", "id": cert.id}
