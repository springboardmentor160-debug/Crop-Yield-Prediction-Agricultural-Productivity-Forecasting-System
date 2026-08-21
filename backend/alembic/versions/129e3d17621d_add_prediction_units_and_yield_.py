"""add prediction units and yield classification

Revision ID: 129e3d17621d
Revises: 22b4d9ae4737
Create Date: 2026-07-16 02:24:27.863475
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "129e3d17621d"
down_revision: Union[str, Sequence[str], None] = (
    "22b4d9ae4737"
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the new columns with temporary defaults so
    # existing prediction rows remain valid.
    op.add_column(
        "yield_predictions",
        sa.Column(
            "production_unit",
            sa.String(length=50),
            nullable=False,
            server_default="metric tons",
        ),
    )

    op.add_column(
        "yield_predictions",
        sa.Column(
            "yield_category",
            sa.String(length=30),
            nullable=False,
            server_default="average",
        ),
    )

    op.add_column(
        "yield_predictions",
        sa.Column(
            "yield_category_label",
            sa.String(length=50),
            nullable=False,
            server_default="Average Yield",
        ),
    )

    op.add_column(
        "yield_predictions",
        sa.Column(
            "yield_category_description",
            sa.String(length=255),
            nullable=False,
            server_default=(
                "Classification was not calculated "
                "for this earlier prediction."
            ),
        ),
    )

    # Correct the old unit stored in existing rows.
    op.execute(
        """
        UPDATE yield_predictions
        SET prediction_unit = 'metric tons per hectare'
        """
    )

    # Update the database-level default for future rows.
    op.alter_column(
        "yield_predictions",
        "prediction_unit",
        existing_type=sa.String(length=80),
        existing_nullable=False,
        server_default="metric tons per hectare",
    )

    op.create_index(
        op.f(
            "ix_yield_predictions_yield_category"
        ),
        "yield_predictions",
        ["yield_category"],
        unique=False,
    )

    # Remove temporary migration defaults from classification
    # fields. New predictions must provide real classifications.
    op.alter_column(
        "yield_predictions",
        "yield_category",
        existing_type=sa.String(length=30),
        existing_nullable=False,
        server_default=None,
    )

    op.alter_column(
        "yield_predictions",
        "yield_category_label",
        existing_type=sa.String(length=50),
        existing_nullable=False,
        server_default=None,
    )

    op.alter_column(
        "yield_predictions",
        "yield_category_description",
        existing_type=sa.String(length=255),
        existing_nullable=False,
        server_default=None,
    )


def downgrade() -> None:
    op.drop_index(
        op.f(
            "ix_yield_predictions_yield_category"
        ),
        table_name="yield_predictions",
    )

    op.drop_column(
        "yield_predictions",
        "yield_category_description",
    )

    op.drop_column(
        "yield_predictions",
        "yield_category_label",
    )

    op.drop_column(
        "yield_predictions",
        "yield_category",
    )

    op.drop_column(
        "yield_predictions",
        "production_unit",
    )

    op.execute(
        """
        UPDATE yield_predictions
        SET prediction_unit =
            'dataset yield units per hectare'
        """
    )

    op.alter_column(
        "yield_predictions",
        "prediction_unit",
        existing_type=sa.String(length=80),
        existing_nullable=False,
        server_default=(
            "dataset yield units per hectare"
        ),
    )