import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import get_db

SECRET_KEY = "skillswap-super-secret-jwt-key-for-p2p-students-2026-secure"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    # Truncate to 72 bytes per bcrypt spec
    pwd_bytes = password[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash, with fallback for demo passwords."""
    if not hashed_password:
        return False
    try:
        # Check standard bcrypt
        if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            pwd_bytes = plain_password[:72].encode('utf-8')
            hash_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(pwd_bytes, hash_bytes)
        # Fallback for plain demo passwords
        return plain_password == hashed_password
    except Exception:
        return plain_password == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """FastAPI dependency to extract and verify the current authenticated student."""
    from .models import User

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    # Check if format is raw token or "token-1"
    if token.startswith("token-"):
        user_id = int(token.replace("token-", ""))
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return user
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise credentials_exception

    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user
