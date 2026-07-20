import hmac
import hashlib
import time
import os
import secrets
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.database import get_db
from app.config import settings
from app.models import User, Role

router = APIRouter(prefix="/auth", tags=["auth"])

# Securely load Secret key from configuration settings
SECRET_KEY_ENV = settings.SECRET_KEY
if not SECRET_KEY_ENV:
    SECRET_KEY_ENV = settings.RAZORPAY_KEY_SECRET
    if not SECRET_KEY_ENV or SECRET_KEY_ENV == "secret_placeholder":
        raise RuntimeError("SECRET_KEY environment variable is not set. A secure cryptographic key is required.")
SECRET_KEY = SECRET_KEY_ENV.encode()

security = HTTPBearer()

# Memory-based rate limiter store: {(ip, endpoint): [timestamps]}
rate_limit_store = defaultdict(list)

def rate_limiter(limit: int, window: int):
    """
    Dependency generator for memory-based rate limiting.
    limit: max requests allowed
    window: time window in seconds
    """
    def dependency(request: Request):
        ip = request.client.host if request.client else "127.0.0.1"
        endpoint = request.url.path
        now = time.time()
        
        # Filter out timestamps older than the window
        timestamps = rate_limit_store[(ip, endpoint)]
        rate_limit_store[(ip, endpoint)] = [t for t in timestamps if now - t < window]
        
        if len(rate_limit_store[(ip, endpoint)]) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later."
            )
        
        rate_limit_store[(ip, endpoint)].append(now)
    return dependency

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    user_id: str

def hash_password(password: str) -> str:
    """Helper to hash passwords securely using PBKDF2-HMAC-SHA256 with a random salt."""
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    return f"{salt.hex()}:{dk.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    """Verifies a password against a PBKDF2-HMAC-SHA256 or legacy SHA256 hash."""
    try:
        if ":" in hashed:
            salt_hex, key_hex = hashed.split(":")
            salt = bytes.fromhex(salt_hex)
            expected_key = bytes.fromhex(key_hex)
            dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
            return dk == expected_key
        else:
            # Legacy SHA-256 fallback (diagnostic_salt)
            legacy_salt = "diagnostic_salt"
            hash_obj = hashlib.sha256((password + legacy_salt).encode())
            return hmac.compare_digest(hash_obj.hexdigest(), hashed)
    except Exception:
        return False

def create_secure_token(user_id: str, role: str) -> str:
    """Generates a secure, signed token: user_id:role:expiry:signature"""
    expiry = int(time.time()) + 28800 # 8 hours expiry (Shorter session length)
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

def create_patient_token(phone: str) -> str:
    """Generates a secure, short-lived signed token for patients: phone:patient:expiry:signature"""
    expiry = int(time.time()) + 1800 # 30 minutes expiry
    payload = f"{phone}:patient:{expiry}"
    signature = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{signature}"

def verify_patient_token(token: str) -> str:
    """Verifies patient token signature and checks expiry."""
    try:
        parts = token.split(":")
        if len(parts) != 4:
            return None
        phone, role, expiry_str, signature = parts
        if role != "patient":
            return None
        expiry = int(expiry_str)
        
        # Verify expiry
        if time.time() > expiry:
            return None
            
        # Verify signature
        payload = f"{phone}:{role}:{expiry}"
        expected_sig = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
        
        if hmac.compare_digest(expected_sig, signature):
            return phone
    except Exception:
        pass
    return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    user_data = verify_secure_token(token)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_data

def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] not in ["MAIN_ADMIN", "SUPPORT_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative access permissions"
        )
    return current_user

def get_lab_tech_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] not in ["MAIN_ADMIN", "SUPPORT_ADMIN", "LAB_TECHNICIAN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to lab technicians and administrators"
        )
    return current_user

@router.post("/login", response_model=TokenResponse, dependencies=[Depends(rate_limiter(limit=5, window=60))])
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
    if not verify_password(password, user.hashed_password):
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
