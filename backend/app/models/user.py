import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"                        # Full platform administration
    GOV_OFFICIAL = "gov_official"          # Government agriculture department
    AGRI_CONSULTANT = "agri_consultant"    # Advises multiple farms, reviews predictions
    COOPERATIVE_MANAGER = "cooperative_manager"  # Manages a cooperative of farms
    FARMER = "farmer"                      # Manages own farm(s)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.FARMER, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    organization: Mapped[str | None] = mapped_column(String(150), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")

    # Permission matrix consulted by RBAC dependency (app.core.rbac)
    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN
