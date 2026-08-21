import logging
from email.message import EmailMessage
from pathlib import Path

import aiosmtplib
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.config import settings

logger = logging.getLogger(__name__)

TEMPLATE_DIRECTORY = (
    Path(__file__).resolve().parent.parent
    / "templates"
    / "emails"
)

template_environment = Environment(
    loader=FileSystemLoader(TEMPLATE_DIRECTORY),
    autoescape=select_autoescape(["html", "xml"]),
)


class EmailDeliveryError(Exception):
    """Raised when an email cannot be delivered."""


def validate_email_configuration() -> None:
    required_values = {
        "SMTP_USERNAME": settings.SMTP_USERNAME,
        "SMTP_PASSWORD": settings.SMTP_PASSWORD,
        "SMTP_FROM_EMAIL": settings.SMTP_FROM_EMAIL,
    }

    missing_values = [
        name
        for name, value in required_values.items()
        if not value or not value.strip()
    ]

    if missing_values:
        raise EmailDeliveryError(
            "Email configuration is incomplete. Missing: "
            + ", ".join(missing_values)
        )


def render_email_template(
    template_name: str,
    context: dict,
) -> str:
    try:
        template = template_environment.get_template(
            template_name
        )

        return template.render(**context)

    except Exception as error:
        logger.exception(
            "email_template_render_failed template=%s",
            template_name,
        )

        raise EmailDeliveryError(
            "Unable to prepare the email message."
        ) from error


async def send_email(
    recipient_email: str,
    subject: str,
    html_content: str,
    plain_text_content: str,
) -> None:
    validate_email_configuration()

    message = EmailMessage()

    message["From"] = (
        f"{settings.SMTP_FROM_NAME} "
        f"<{settings.SMTP_FROM_EMAIL}>"
    )
    message["To"] = recipient_email
    message["Subject"] = subject

    message.set_content(plain_text_content)

    message.add_alternative(
        html_content,
        subtype="html",
    )

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            start_tls=settings.SMTP_USE_TLS,
            timeout=20,
        )

        logger.info(
            "email_sent recipient=%s subject=%s",
            recipient_email,
            subject,
        )

    except Exception as error:
        logger.exception(
            "email_delivery_failed recipient=%s subject=%s",
            recipient_email,
            subject,
        )

        raise EmailDeliveryError(
            "The email could not be delivered. Please try again."
        ) from error


async def send_verification_otp_email(
    recipient_email: str,
    recipient_name: str,
    otp_code: str,
) -> None:
    html_content = render_email_template(
        template_name="verification_otp.html",
        context={
            "recipient_name": recipient_name,
            "otp_code": otp_code,
            "expiry_minutes": settings.OTP_EXPIRY_MINUTES,
        },
    )

    plain_text_content = (
        f"Hello {recipient_name},\n\n"
        f"Your YieldSense AI email verification OTP is: "
        f"{otp_code}\n\n"
        f"This OTP expires in "
        f"{settings.OTP_EXPIRY_MINUTES} minutes.\n\n"
        "Do not share this code with anyone."
    )

    await send_email(
        recipient_email=recipient_email,
        subject="Verify your YieldSense AI account",
        html_content=html_content,
        plain_text_content=plain_text_content,
    )


async def send_password_reset_otp_email(
    recipient_email: str,
    recipient_name: str,
    otp_code: str,
) -> None:
    html_content = render_email_template(
        template_name="password_reset_otp.html",
        context={
            "recipient_name": recipient_name,
            "otp_code": otp_code,
            "expiry_minutes": settings.OTP_EXPIRY_MINUTES,
        },
    )

    plain_text_content = (
        f"Hello {recipient_name},\n\n"
        f"Your YieldSense AI password reset OTP is: "
        f"{otp_code}\n\n"
        f"This OTP expires in "
        f"{settings.OTP_EXPIRY_MINUTES} minutes.\n\n"
        "If you did not request a password reset, "
        "you can safely ignore this email."
    )

    await send_email(
        recipient_email=recipient_email,
        subject="Reset your YieldSense AI password",
        html_content=html_content,
        plain_text_content=plain_text_content,
    )