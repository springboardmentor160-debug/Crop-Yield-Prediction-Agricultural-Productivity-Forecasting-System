"""
YieldSense AI - Permission Matrix
Single source of truth for role-based access control, matching the
Farmer / Analyst / Admin permissions table.

Usage:
    from app.core.permissions import require_permission, check_farm_ownership

    @router.put("/farms/{farm_id}")
    def edit_farm(
        farm_id: int,
        current_user: models.User = Depends(require_permission("edit_own_farms")),
        ...
    ):
        ...

This replaces scattering `require_role("X")` checks across routers with a
single declarative table, so a permission change only needs to happen here.
"""
from fastapi import Depends, HTTPException
from app import models
from app.core.deps import get_current_user

# --------------------------------------------------------------------------
# The permission matrix - mirrors the table exactly.
# Each key is an action; value is the set of roles allowed to perform it.
# --------------------------------------------------------------------------
PERMISSIONS = {
    # Farms
    "view_own_farms":        {"Farmer", "Analyst", "Admin"},
    "add_farm":               {"Farmer", "Admin"},
    "edit_own_farms":         {"Farmer", "Admin"},
    "view_all_farms":         {"Analyst", "Admin"},
    "delete_any_farm":        {"Admin"},

    # Predictions
    "yield_prediction":       {"Farmer", "Analyst", "Admin"},

    # Analytics
    "analytics_dashboard_limited": {"Farmer"},
    "analytics_dashboard_full":    {"Analyst", "Admin"},

    # Reports
    "reports_own":            {"Farmer"},
    "reports_all":            {"Analyst", "Admin"},

    # Admin-only
    "manage_users":           {"Admin"},
    "change_user_roles":      {"Admin"},
    "system_settings":        {"Admin"},

    # AI model metrics
    "ai_model_view":          {"Farmer", "Analyst", "Admin"},
    "ai_model_full":          {"Admin"},

    # Notifications
    "notifications_own":      {"Farmer", "Analyst"},
    "notifications_broadcast": {"Admin"},
}


def has_permission(role: str, action: str) -> bool:
    """Pure check, no HTTP side effects - handy for conditional logic in
    business code (e.g. deciding what to include in a response) rather than
    gating an entire endpoint."""
    allowed_roles = PERMISSIONS.get(action)
    if allowed_roles is None:
        # Fail closed: an action not present in the matrix is denied by
        # default rather than silently allowed. Add it above if it's real.
        return False
    return role in allowed_roles


def require_permission(action: str):
    """
    Dependency factory. Use exactly like require_role("Admin") but checks
    against the permission matrix instead of a single hardcoded role.

        current_user: models.User = Depends(require_permission("delete_any_farm"))
    """
    def dependency(current_user: models.User = Depends(get_current_user)) -> models.User:
        if not has_permission(current_user.role, action):
            raise HTTPException(
                status_code=403,
                detail=f"Role '{current_user.role}' does not have permission: {action}",
            )
        return current_user
    return dependency


def check_farm_ownership(farm: models.Farm, user: models.User) -> None:
    """
    Object-level check for endpoints where role alone isn't enough - e.g.
    a Farmer can edit farms, but only their OWN farms. Admins bypass
    ownership entirely (delete_any_farm / edit any farm).

    Raises 403 if the user isn't the owner and isn't an Admin.
    """
    if user.role == "Admin":
        return
    if farm.user_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this farm",
        )