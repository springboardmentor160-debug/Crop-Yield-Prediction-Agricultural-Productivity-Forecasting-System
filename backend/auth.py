from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_conn

from auth_handler import (
    hash_password,
    verify_password,
    create_token
)

router = APIRouter()


class User(BaseModel):

    name: str | None = None
    email: str
    password: str
    role: str = "Farmer"



# REGISTER

@router.post("/register")
def register(user: User):

    conn = get_conn()
    cur = conn.cursor()


    cur.execute(
        "SELECT email FROM users WHERE email=%s",
        (user.email,)
    )


    if cur.fetchone():

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    cur.execute(
        """
        INSERT INTO users(name,email,password_hash,role)
        VALUES(%s,%s,%s,%s)
        """,

        (
            user.name,
            user.email,
            hash_password(user.password),
            user.role
        )
    )


    conn.commit()


    return {
        "message":"Account created successfully"
    }




# LOGIN

@router.post("/login")
def login(user: User):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id,name,email,password_hash,role
        FROM users
        WHERE email=%s
        """,
        (user.email,)
    )

    db_user = cur.fetchone()

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(user.password, db_user[3]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_token(
        {
            "id": db_user[0],
            "name": db_user[1],
            "email": db_user[2],
            "role": db_user[4],
        }
    )

    return {
        "message": "Login Successful",
        "id": db_user[0],
        "name": db_user[1],
        "email": db_user[2],
        "role": db_user[4],
        "access_token": token,
        "token_type": "bearer"
    }