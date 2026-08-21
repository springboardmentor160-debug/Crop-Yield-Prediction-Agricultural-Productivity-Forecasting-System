from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import RefreshRequest, TokenPair, UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        phone=payload.phone,
        organization=payload.organization,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access = create_access_token(str(user.id), {"role": user.role.value})
    refresh = create_refresh_token(str(user.id))
    return TokenPair(access_token=access, refresh_token=refresh, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenPair)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account has been deactivated")

    access = create_access_token(str(user.id), {"role": user.role.value})
    refresh = create_refresh_token(str(user.id))
    return TokenPair(access_token=access, refresh_token=refresh, user=UserOut.model_validate(user))


@router.post("/refresh", response_model=TokenPair)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    data = decode_token(payload.refresh_token)
    if data is None or data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
    user = db.get(User, int(data["sub"]))
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account not found or inactive")

    access = create_access_token(str(user.id), {"role": user.role.value})
    new_refresh = create_refresh_token(str(user.id))
    return TokenPair(access_token=access, refresh_token=new_refresh, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
