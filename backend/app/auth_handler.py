import jwt
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "YIELDSENSE_SUPER_SECURE_PHRASE"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_agent = HTTPBearer()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload.update({"exp": datetime.now(timezone.utc) + timedelta(hours=8)})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user_role(credentials: HTTPAuthorizationCredentials = Security(security_agent)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # Contains user ID and user role permissions mapping
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token session credentials")
