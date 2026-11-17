"""Cross-cutting FastAPI dependencies (DB session, auth, RBAC)."""

import uuid
from collections.abc import Awaitable, Callable
from typing import Annotated

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.modules.users.models import User, UserRole

DbSession = Annotated[AsyncSession, Depends(get_db)]

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> User:
    if credentials is None:
        raise UnauthorizedError("Autentikasi diperlukan")
    try:
        payload = decode_token(credentials.credentials, "access")
    except jwt.PyJWTError as exc:
        raise UnauthorizedError("Token tidak valid atau kedaluwarsa") from exc

    user = await db.get(User, _as_uuid(payload["sub"]))
    if user is None or not user.is_active:
        raise UnauthorizedError("Akun tidak aktif")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*roles: UserRole) -> Callable[[User], Awaitable[User]]:
    """RBAC guard. Admins always pass."""

    async def checker(user: CurrentUser) -> User:
        if user.role != UserRole.ADMIN and user.role not in roles:
            raise ForbiddenError("Anda tidak memiliki akses ke sumber daya ini")
        return user

    return checker


StaffUser = Annotated[User, Depends(require_roles(UserRole.EDITOR))]


def _as_uuid(value: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError as exc:
        raise UnauthorizedError("Token tidak valid") from exc
