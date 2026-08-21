"""secure email otp system

Revision ID: d51d0323e7ba
Revises: 040aed61d78e
Create Date: 2026-07-12 22:47:21.563489
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d51d0323e7ba"
down_revision: Union[str, Sequence[str], None] = "040aed61d78e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Replace the old temporary OTP table with the secure OTP structure.

    Existing OTP rows are intentionally removed because OTPs are
    short-lived security records and cannot be safely converted from
    plaintext codes into hashed records.
    """

    op.drop_table("email_otps")

    op.create_table(
        "email_otps",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "purpose",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "otp_hash",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "used_at",
            sa.DateTime(),
            nullable=True,
        ),
        sa.Column(
            "failed_attempts",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "last_sent_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_email_otps_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "id",
            name="pk_email_otps",
        ),
    )

    op.create_index(
        "ix_email_otps_id",
        "email_otps",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_email_otps_user_id",
        "email_otps",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        "ix_email_otps_purpose",
        "email_otps",
        ["purpose"],
        unique=False,
    )

    op.create_index(
        "ix_email_otps_expires_at",
        "email_otps",
        ["expires_at"],
        unique=False,
    )

    op.create_index(
        "ix_email_otps_is_active",
        "email_otps",
        ["is_active"],
        unique=False,
    )


def downgrade() -> None:
    """
    Restore the previous development OTP table structure.

    Existing secure OTP records are removed during downgrade because
    they cannot be safely converted back into plaintext OTP codes.
    """

    op.drop_index(
        "ix_email_otps_is_active",
        table_name="email_otps",
    )

    op.drop_index(
        "ix_email_otps_expires_at",
        table_name="email_otps",
    )

    op.drop_index(
        "ix_email_otps_purpose",
        table_name="email_otps",
    )

    op.drop_index(
        "ix_email_otps_user_id",
        table_name="email_otps",
    )

    op.drop_index(
        "ix_email_otps_id",
        table_name="email_otps",
    )

    op.drop_table("email_otps")

    op.create_table(
        "email_otps",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "email",
            sa.String(length=120),
            nullable=False,
        ),
        sa.Column(
            "otp_code",
            sa.String(length=10),
            nullable=False,
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "is_used",
            sa.Boolean(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint(
            "id",
            name="pk_email_otps",
        ),
    )

    op.create_index(
        "ix_email_otps_id",
        "email_otps",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_email_otps_email",
        "email_otps",
        ["email"],
        unique=False,
    )