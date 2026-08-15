from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import SessionLocal
from models.user import User

router = APIRouter()

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import SessionLocal
from models.user import User

router = APIRouter()


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(user: RegisterRequest):

    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=user.password,
        role="Farmer"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    db.close()

    return {
        "message": "User saved in PostgreSQL successfully"
    }


@router.post("/login")
def login(user: LoginRequest):

    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == user.email,
        User.password_hash == user.password
    ).first()

    db.close()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user": existing_user.name,
        "role": existing_user.role
    }