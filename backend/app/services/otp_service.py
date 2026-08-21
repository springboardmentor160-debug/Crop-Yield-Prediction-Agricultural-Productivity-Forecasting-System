import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import EmailOTP, User

EMAIL_VERIFICATION_PURPOSE = "email_verification"
PASSWORD_RESET_PURPOSE = "password_reset"

VALID_OTP_PURPOSES = {
    EMAIL_VERIFICATION_PURPOSE,
    PASSWORD_RESET_PURPOSE,
}


def generate_otp_code() -> str:
    """
    Generate a cryptographically secure six-digit OTP.

    The returned plain OTP must only be sent through email.
    It must never be stored directly in the database or logs.
    """
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(
    otp_code: str,
    user_id: int,
    purpose: str,
) -> str:
    """
    Hash the OTP using the application secret, user ID, and purpose.

    Adding the user ID and purpose prevents the same OTP hash from
    being reusable between different users or OTP operations.
    """
    value = (
        f"{settings.SECRET_KEY}:"
        f"{user_id}:"
        f"{purpose}:"
        f"{otp_code}"
    )

    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def verify_otp_hash(
    otp_code: str,
    stored_hash: str,
    user_id: int,
    purpose: str,
) -> bool:
    candidate_hash = hash_otp(
        otp_code=otp_code,
        user_id=user_id,
        purpose=purpose,
    )

    return hmac.compare_digest(candidate_hash, stored_hash)


def validate_purpose(purpose: str) -> None:
    if purpose not in VALID_OTP_PURPOSES:
        raise ValueError(f"Unsupported OTP purpose: {purpose}")


def get_latest_otp(
    db: Session,
    user_id: int,
    purpose: str,
) -> EmailOTP | None:
    validate_purpose(purpose)

    return (
        db.query(EmailOTP)
        .filter(
            EmailOTP.user_id == user_id,
            EmailOTP.purpose == purpose,
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )


def get_resend_wait_seconds(
    db: Session,
    user_id: int,
    purpose: str,
) -> int:
    """
    Returns how many seconds remain before another OTP can be sent.

    Returns zero when resending is allowed.
    """
    latest_otp = get_latest_otp(
        db=db,
        user_id=user_id,
        purpose=purpose,
    )

    if not latest_otp:
        return 0

    sent_at = latest_otp.last_sent_at or latest_otp.created_at

    elapsed_seconds = (
        datetime.now(UTC).replace(tzinfo=None) - sent_at
    ).total_seconds()

    remaining_seconds = (
        settings.OTP_RESEND_COOLDOWN_SECONDS
        - int(elapsed_seconds)
    )

    return max(0, remaining_seconds)


def ensure_resend_allowed(
    db: Session,
    user_id: int,
    purpose: str,
) -> None:
    remaining_seconds = get_resend_wait_seconds(
        db=db,
        user_id=user_id,
        purpose=purpose,
    )

    if remaining_seconds > 0:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Please wait {remaining_seconds} seconds "
                "before requesting another OTP"
            ),
            headers={
                "Retry-After": str(remaining_seconds),
            },
        )


def invalidate_active_otps(
    db: Session,
    user_id: int,
    purpose: str,
) -> None:
    validate_purpose(purpose)

    active_otps = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.user_id == user_id,
            EmailOTP.purpose == purpose,
            EmailOTP.is_active.is_(True),
        )
        .all()
    )

    for otp_record in active_otps:
        otp_record.is_active = False


def create_otp(
    db: Session,
    user: User,
    purpose: str,
) -> str:
    """
    Create and store a secure OTP record.

    Returns the plain OTP only so the caller can send it by email.
    """
    validate_purpose(purpose)

    ensure_resend_allowed(
        db=db,
        user_id=user.id,
        purpose=purpose,
    )

    invalidate_active_otps(
        db=db,
        user_id=user.id,
        purpose=purpose,
    )

    now = datetime.now(UTC).replace(tzinfo=None)
    otp_code = generate_otp_code()

    otp_record = EmailOTP(
        user_id=user.id,
        purpose=purpose,
        otp_hash=hash_otp(
            otp_code=otp_code,
            user_id=user.id,
            purpose=purpose,
        ),
        expires_at=now
        + timedelta(minutes=settings.OTP_EXPIRY_MINUTES),
        used_at=None,
        failed_attempts=0,
        created_at=now,
        last_sent_at=now,
        is_active=True,
    )

    db.add(otp_record)
    db.commit()
    db.refresh(otp_record)

    return otp_code


def verify_otp(
    db: Session,
    user: User,
    purpose: str,
    otp_code: str,
) -> EmailOTP:
    validate_purpose(purpose)

    normalized_otp = otp_code.strip()

    if (
        len(normalized_otp) != 6
        or not normalized_otp.isdigit()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP must be a six-digit number",
        )

    otp_record = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.user_id == user.id,
            EmailOTP.purpose == purpose,
            EmailOTP.is_active.is_(True),
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No active OTP was found. "
                "Please request a new OTP."
            ),
        )

    if otp_record.used_at is not None:
        otp_record.is_active = False
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This OTP has already been used",
        )

    if datetime.now(UTC).replace(tzinfo=None) > otp_record.expires_at:
        otp_record.is_active = False
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new OTP.",
        )

    if (
        otp_record.failed_attempts
        >= settings.OTP_MAX_ATTEMPTS
    ):
        otp_record.is_active = False
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "Maximum OTP attempts exceeded. "
                "Please request a new OTP."
            ),
        )

    is_valid = verify_otp_hash(
        otp_code=normalized_otp,
        stored_hash=otp_record.otp_hash,
        user_id=user.id,
        purpose=purpose,
    )

    if not is_valid:
        otp_record.failed_attempts += 1

        attempts_remaining = max(
            0,
            settings.OTP_MAX_ATTEMPTS
            - otp_record.failed_attempts,
        )

        if attempts_remaining == 0:
            otp_record.is_active = False

        db.commit()

        if attempts_remaining == 0:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    "Maximum OTP attempts exceeded. "
                    "Please request a new OTP."
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid OTP. "
                f"{attempts_remaining} attempt(s) remaining."
            ),
        )

    otp_record.used_at = datetime.now(UTC).replace(tzinfo=None)
    otp_record.is_active = False

    db.commit()
    db.refresh(otp_record)

    return otp_record