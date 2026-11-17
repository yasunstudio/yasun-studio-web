"""Authentication with rotating refresh tokens tracked in Redis.

A refresh token is valid only while `auth:refresh:{jti}` exists in Redis.
Refreshing deletes the old jti (rotation) and logout revokes it — so stolen
refresh tokens can be invalidated server-side.
"""

import uuid

import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedError
from app.core.redis import redis_client
from app.core.security import create_token, decode_token, verify_password
from app.modules.auth.schemas import RegisterRequest, TokenPair
from app.modules.users.models import User, UserRole
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserCreate, UserRead
from app.modules.users.service import UserService

_REFRESH_KEY = "auth:refresh:{jti}"


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.users = UserRepository(session)

    async def login(self, email: str, password: str) -> TokenPair:
        user = await self.users.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise UnauthorizedError("Email atau kata sandi salah")
        if not user.is_active:
            raise UnauthorizedError("Akun tidak aktif")
        return await self._issue(user)

    async def register(self, data: RegisterRequest) -> TokenPair:
        """Self-service sign-up — always creates a learner (member) account."""
        user = await UserService(self.users.session).create(
            UserCreate(
                full_name=data.full_name,
                email=data.email,
                password=data.password,
                role=UserRole.MEMBER,
            )
        )
        return await self._issue(user)

    async def refresh(self, refresh_token: str) -> TokenPair:
        try:
            payload = decode_token(refresh_token, "refresh")
        except jwt.PyJWTError as exc:
            raise UnauthorizedError("Refresh token tidak valid") from exc

        # Atomic get-and-delete → a refresh token can be used exactly once.
        user_id = await redis_client.getdel(_REFRESH_KEY.format(jti=payload["jti"]))
        if user_id is None or user_id != payload["sub"]:
            raise UnauthorizedError("Sesi telah berakhir, silakan login kembali")

        user = await self.users.get(uuid.UUID(user_id))
        if not user or not user.is_active:
            raise UnauthorizedError("Akun tidak aktif")
        return await self._issue(user)

    async def logout(self, refresh_token: str) -> None:
        try:
            payload = decode_token(refresh_token, "refresh")
        except jwt.PyJWTError:
            return
        await redis_client.delete(_REFRESH_KEY.format(jti=payload["jti"]))

    async def _issue(self, user: User) -> TokenPair:
        claims = {"role": user.role.value, "name": user.full_name}
        access, _, access_ttl = create_token(str(user.id), "access", claims)
        refresh, jti, refresh_ttl = create_token(str(user.id), "refresh")
        await redis_client.set(_REFRESH_KEY.format(jti=jti), str(user.id), ex=refresh_ttl)
        return TokenPair(
            access_token=access,
            refresh_token=refresh,
            expires_in=access_ttl,
            user=UserRead.model_validate(user),
        )
