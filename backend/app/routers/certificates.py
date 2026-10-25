import os
import uuid
import secrets
import re
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Certificate, User
from ..schemas import CertificateCreate, CertificateOut, CertificateStatusUpdate
from ..security import get_current_user, decode_access_token, oauth2_scheme

router = APIRouter(prefix="/certificates", tags=["certificates"])

# Secure server-side storage for certificate uploads
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "certificates"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB maximum

def get_optional_or_query_user(
    token_header: Optional[str] = Depends(oauth2_scheme),
    token: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Safely resolves the authenticated user from either the standard Authorization header
    or a 'token' query parameter (useful for opening verified files or documents in browser tabs).
    """
    resolved_token = token_header or token
    if not resolved_token:
        return None
    try:
        if resolved_token.startswith("token-"):
            uid = int(resolved_token.replace("token-", ""))
            return db.query(User).filter(User.id == uid).first()
        payload = decode_access_token(resolved_token)
        if payload and "sub" in payload:
            return db.query(User).filter(User.id == int(payload["sub"])).first()
    except Exception:
        return None
    return None

def validate_magic_bytes(header: bytes) -> tuple[str, str]:
    """
    Validates file signature / magic bytes.
    Never trusts user-submitted extensions or headers alone.
    Returns (verified_mime_type, safe_extension).
    """
    if header.startswith(b"%PDF-"):
        return "application/pdf", ".pdf"
    elif header.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png", ".png"
    elif header.startswith(b"\xff\xd8\xff"):
        return "image/jpeg", ".jpg"
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Only authentic PDF, PNG, and JPG files are supported."
        )

def format_cert_out(c: Certificate) -> dict:
    owner = c.user
    return {
        "id": c.id,
        "user_id": c.user_id,
        "student_name": owner.name if owner else f"Student #{c.user_id}",
        "student_username": owner.username if owner else "",
        "student_avatar": owner.avatar_url if owner else "",
        "student_college": getattr(owner, "college", "") or "",
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

@router.get("")
def list_certificates(
    user_id: Optional[int] = None,
    scope: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List certificates for a student or across students for admin moderation.
    If scope="all" and caller is admin, returns all certificates.
    If scope="pending" and caller is admin, returns all pending certificates.
    If user_id is provided, lists for that user.
    Otherwise lists for the authenticated user (or user 1 as fallback).
    """
    is_admin = bool(current_user and getattr(current_user, "is_admin", False))
    if scope in ("all", "pending") and is_admin:
        query = db.query(Certificate)
        if scope == "pending":
            query = query.filter(Certificate.verification_status == "Pending")
        certs = query.order_by(Certificate.id.desc()).all()
        return [format_cert_out(c) for c in certs]

    target_id = user_id or (current_user.id if current_user else 1)
    certs = db.query(Certificate).filter(Certificate.user_id == target_id).order_by(Certificate.id.desc()).all()
    return [format_cert_out(c) for c in certs]

@router.post("/upload")
async def upload_certificate(
    file: UploadFile = File(...),
    title: str = Form(...),
    issuer: str = Form(...),
    issue_date: str = Form(...),
    related_skill: Optional[str] = Form(""),
    credential_id: Optional[str] = Form(""),
    credential_url: Optional[str] = Form(""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and register a verified certificate with server-side file type and size verification.
    New certificates start in 'Pending' status and require review.
    """
    # 1. Validate required fields
    title_clean = title.strip()
    issuer_clean = issuer.strip()
    issue_date_clean = issue_date.strip()

    if not title_clean:
        raise HTTPException(status_code=400, detail="Certificate title is required.")
    if not issuer_clean:
        raise HTTPException(status_code=400, detail="Issuing organization is required.")
    if not issue_date_clean:
        raise HTTPException(status_code=400, detail="Issue date or year is required.")

    # 2. Read and validate file content
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 5 MB limit.")

    # 3. Server-side magic bytes validation (never trust extension alone)
    mime_type, safe_ext = validate_magic_bytes(content[:32])

    # 4. Generate cryptographically safe internal filename (no path traversal)
    safe_filename = f"{uuid.uuid4().hex}_{secrets.token_hex(4)}{safe_ext}"
    destination_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(destination_path, "wb") as f:
        f.write(content)

    # Clean original filename for safe display
    clean_original_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', os.path.basename(file.filename or 'certificate'))

    # 5. Save to database with status="Pending" (never auto-verified)
    cert = Certificate(
        user_id=current_user.id,
        title=title_clean,
        issuer=issuer_clean,
        issue_date=issue_date_clean,
        related_skill=related_skill.strip() if related_skill else "",
        credential_url=credential_url.strip() if credential_url else "",
        credential_id=credential_id.strip() if credential_id else "",
        badge_icon="Award",
        is_verified=False,
        verification_status="Pending",
        file_path=safe_filename,
        file_name=clean_original_name,
        file_size=len(content),
        mime_type=mime_type,
        created_at=datetime.utcnow()
    )

    db.add(cert)
    db.commit()
    db.refresh(cert)

    return {
        "message": "Certificate uploaded successfully and submitted for verification.",
        "certificate": format_cert_out(cert)
    }

@router.post("")
def add_certificate(
    payload: CertificateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add certificate metadata or credential link without a direct file upload.
    Starts in 'Pending' status.
    """
    title_clean = payload.title.strip()
    issuer_clean = payload.issuer.strip()
    issue_date_clean = payload.issue_date.strip()

    if not title_clean:
        raise HTTPException(status_code=400, detail="Certificate title is required.")
    if not issuer_clean:
        raise HTTPException(status_code=400, detail="Issuing organization is required.")
    if not issue_date_clean:
        raise HTTPException(status_code=400, detail="Issue date or year is required.")

    cert = Certificate(
        user_id=current_user.id,
        title=title_clean,
        issuer=issuer_clean,
        issue_date=issue_date_clean,
        related_skill=payload.related_skill or "",
        credential_url=payload.credential_url or "",
        credential_id=payload.credential_id or "",
        badge_icon=payload.badge_icon or "Award",
        is_verified=False,
        verification_status="Pending",
        created_at=datetime.utcnow()
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)

    return {
        "message": "Certificate added and submitted for verification.",
        "id": cert.id,
        "certificate": format_cert_out(cert)
    }

@router.get("/{cert_id}/file")
def get_certificate_file(
    cert_id: int,
    user: Optional[User] = Depends(get_optional_or_query_user),
    db: Session = Depends(get_db)
):
    """
    Secure file streaming for certificate proofs.
    Access restricted to certificate owner, administrators, or publicly verified certificates.
    """
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    if not cert.file_path:
        raise HTTPException(status_code=404, detail="No file attached to this certificate.")

    # Authorization check
    is_owner = bool(user and cert.user_id == user.id)
    is_admin = bool(user and getattr(user, "is_admin", False))
    is_public = bool(cert.verification_status == "Verified" and cert.is_verified)

    if not (is_owner or is_admin or is_public):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this certificate proof file. Please sign in as owner or administrator."
        )

    file_path = os.path.join(UPLOAD_DIR, cert.file_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Certificate file not found on server storage.")

    return FileResponse(
        file_path,
        media_type=cert.mime_type or "application/octet-stream",
        filename=cert.file_name or "certificate"
    )

@router.delete("/{cert_id}")
def delete_certificate(
    cert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a certificate owned by the current student.
    Enforces strict ownership check.
    """
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    is_owner = (cert.user_id == current_user.id)
    is_admin = bool(getattr(current_user, "is_admin", False))

    if not (is_owner or is_admin):
        raise HTTPException(
            status_code=403,
            detail="Permission denied. You can only delete your own certificates."
        )

    # Safely remove file from disk if present
    if cert.file_path:
        file_path = os.path.join(UPLOAD_DIR, cert.file_path)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Warning: could not delete file {file_path}: {e}")

    db.delete(cert)
    db.commit()

    return {"message": "Certificate deleted successfully.", "id": cert_id}

@router.patch("/{cert_id}/status")
def update_certificate_status(
    cert_id: int,
    payload: CertificateStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin-only endpoint to verify, reject, or reset a certificate's verification status.
    """
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=403,
            detail="Only authorized administrators can change certificate verification status."
        )

    valid_statuses = {"Pending", "Verified", "Rejected"}
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Allowed statuses: {', '.join(valid_statuses)}"
        )

    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    was_verified = cert.is_verified
    cert.verification_status = payload.status
    cert.is_verified = (payload.status == "Verified")

    # Award +100 XP to certificate owner if newly verified
    if cert.is_verified and not was_verified:
        owner = db.query(User).filter(User.id == cert.user_id).first()
        if owner:
            owner.xp += 100

    db.commit()
    db.refresh(cert)

    return {
        "message": f"Certificate status updated to {payload.status}.",
        "certificate": format_cert_out(cert)
    }
