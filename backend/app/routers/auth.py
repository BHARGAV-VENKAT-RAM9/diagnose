import hmac
import hashlib
import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.database import get_db
from app.config import settings
from app.models import User, Role

router = APIRouter(prefix="/auth", tags=["auth"])

# Secret key for token signature (fallback to default string)
SECRET_KEY = settings.RAZORPAY_KEY_SECRET.encode()

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    user_id: str

def hash_password(password: str, salt: str = "diagnostic_salt") -> str:
    """Helper to hash passwords using SHA256 with a salt."""
    hash_obj = hashlib.sha256((password + salt).encode())
    return hash_obj.hexdigest()

def create_secure_token(user_id: str, role: str) -> str:
    """Generates a secure, signed token: user_id:role:expiry:signature"""
    expiry = int(time.time()) + 86400 # 24 hours expiry
    payload = f"{user_id}:{role}:{expiry}"
    signature = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{signature}"

def verify_secure_token(token: str) -> dict:
    """Verifies secure token signature and checks expiry."""
    try:
        parts = token.split(":")
        if len(parts) != 4:
            return None
        user_id, role, expiry_str, signature = parts
        expiry = int(expiry_str)
        
        # Verify expiry
        if time.time() > expiry:
            return None
            
        # Verify signature
        payload = f"{user_id}:{role}:{expiry}"
        expected_sig = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
        
        if hmac.compare_digest(expected_sig, signature):
            return {"user_id": user_id, "role": role}
    except Exception:
        pass
    return None


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates staff users and issues secure signed tokens."""
    username = payload.username
    password = payload.password

    # Query user
    user = db.query(User).filter(User.username == username, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # Hash input password and verify
    hashed_input = hash_password(password)
    if user.hashed_password != hashed_input:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # Resolve role name
    role = db.query(Role).filter(Role.id == user.role_id).first()
    role_name = role.name if role else "LAB_TECHNICIAN"

    # Create signed token
    token = create_secure_token(str(user.id), role_name)

    return TokenResponse(
        access_token=token,
        role=role_name,
        full_name=user.full_name,
        user_id=str(user.id)
    )
