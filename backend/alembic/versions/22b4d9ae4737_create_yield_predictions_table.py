"""create yield predictions table

Revision ID: 22b4d9ae4737
Revises: efa966b847e4
Create Date: 2026-07-14 00:08:45.505993
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "22b4d9ae4737"
down_revision: Union[str, Sequence[str], None] = "efa966b847e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "yield_predictions",

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
            "farm_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "farm_name",
            sa.String(length=120),
            nullable=False,
        ),
        sa.Column(
            "state",
            sa.String(length=120),
            nullable=False,
        ),
        sa.Column(
            "crop",
            sa.String(length=120),
            nullable=False,
        ),
        sa.Column(
            "crop_year",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "season",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "area_hectares",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "annual_rainfall",
            sa.Float(),
            nullable=False,
        ),
        sa.Column(
            "fertilizer",
            sa.Float(),
            nullable=False,
        ),
        sa.Column(
            "pesticide",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "nitrogen",
            sa.Float(),
            nullable=False,
        ),
        sa.Column(
            "phosphorus",
            sa.Float(),
            nullable=False,
        ),
        sa.Column(
            "potassium",
            sa.Float(),
            nullable=False,
        ),
        sa.Column(
            "ph",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "average_temperature_c",
            sa.Float(),
            nullable=False,
        ),
        sa.Column(
            "total_rainfall_mm",
            sa.Float(),
            nullable=False,
        ),
        sa.Column(
            "average_humidity_percent",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "predicted_yield",
            sa.Float(),
            nullable=False,
        ),
        sa.Column(
            "estimated_production",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "model_name",
            sa.String(length=120),
            nullable=False,
        ),
        sa.Column(
            "model_version",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "prediction_unit",
            sa.String(length=80),
            nullable=False,
        ),
        sa.Column(
            "explanation",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),

        sa.ForeignKeyConstraint(
            ["farm_id"],
            ["farms.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_yield_predictions_id"),
        "yield_predictions",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_yield_predictions_user_id"),
        "yield_predictions",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_yield_predictions_farm_id"),
        "yield_predictions",
        ["farm_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_yield_predictions_state"),
        "yield_predictions",
        ["state"],
        unique=False,
    )

    op.create_index(
        op.f("ix_yield_predictions_crop"),
        "yield_predictions",
        ["crop"],
        unique=False,
    )

    op.create_index(
        op.f("ix_yield_predictions_crop_year"),
        "yield_predictions",
        ["crop_year"],
        unique=False,
    )

    op.create_index(
        op.f("ix_yield_predictions_season"),
        "yield_predictions",
        ["season"],
        unique=False,
    )

    op.create_index(
        op.f("ix_yield_predictions_created_at"),
        "yield_predictions",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_yield_predictions_created_at"),
        table_name="yield_predictions",
    )

    op.drop_index(
        op.f("ix_yield_predictions_season"),
        table_name="yield_predictions",
    )

    op.drop_index(
        op.f("ix_yield_predictions_crop_year"),
        table_name="yield_predictions",
    )

    op.drop_index(
        op.f("ix_yield_predictions_crop"),
        table_name="yield_predictions",
    )

    op.drop_index(
        op.f("ix_yield_predictions_state"),
        table_name="yield_predictions",
    )

    op.drop_index(
        op.f("ix_yield_predictions_farm_id"),
        table_name="yield_predictions",
    )

    op.drop_index(
        op.f("ix_yield_predictions_user_id"),
        table_name="yield_predictions",
    )

    op.drop_index(
        op.f("ix_yield_predictions_id"),
        table_name="yield_predictions",
    )

    op.drop_table("yield_predictions")