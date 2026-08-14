from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta


SECRET_KEY="yieldsense_secret_key"
ALGORITHM="HS256"


pwd_context=CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password):

    return pwd_context.hash(password)


def verify_password(password,hashed):

    return pwd_context.verify(password,hashed)


def create_token(data):

    payload=data.copy()

    payload["exp"]=datetime.utcnow()+timedelta(hours=2)

    token=jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token