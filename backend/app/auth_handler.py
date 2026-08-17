import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext


SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

import bcrypt
from app.db import fetch_one

security_agent = HTTPBearer(auto_error=False)


def _require_secret() -> str:
    if not SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY must be configured before starting YieldSense.")
    return SECRET_KEY


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False



def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload.update({"exp": datetime.now(timezone.utc) + timedelta(hours=8)})
    return jwt.encode(payload, _require_secret(), algorithm=ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security_agent)):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication credentials were not provided")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, _require_secret(), algorithms=[ALGORITHM])
        if not payload.get("sub"):
            raise HTTPException(status_code=401, detail="Invalid token session credentials")
        user = fetch_one("SELECT id, email, role FROM users WHERE id = ?", (int(payload["sub"]),))
        if not user:
            raise HTTPException(status_code=401, detail="Account is no longer active")
        # Resolve permissions from the database on every request so a role change
        # takes effect immediately, even for an already-issued token.
        return {"sub": str(user["id"]), "email": user["email"], "role": user["role"]}
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid token session credentials") from exc


def require_admin(current_user: dict = Security(get_current_user)):
    if current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    return current_user
