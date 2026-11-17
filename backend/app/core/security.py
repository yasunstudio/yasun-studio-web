"""Password hashing (Argon2) and JWT handling."""

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any, Literal

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

TokenType = Literal["access", "refresh"]

_password_hash = PasswordHash.recommended()  # Argon2id


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return _password_hash.verify(password, hashed)


def create_token(
    subject: str, token_type: TokenType, extra: dict[str, Any] | None = None
) -> tuple[str, str, int]:
    """Create a signed JWT. Returns (token, jti, ttl_seconds)."""
    ttl = (
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        if token_type == "access"
        else timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    now = datetime.now(UTC)
    jti = uuid.uuid4().hex
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "jti": jti,
        "iat": now,
        "exp": now + ttl,
        **(extra or {}),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, jti, int(ttl.total_seconds())


def decode_token(token: str, expected_type: TokenType) -> dict[str, Any]:
    """Decode & validate a JWT. Raises jwt.PyJWTError on any problem."""
    payload: dict[str, Any] = jwt.decode(
        token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
    )
    if payload.get("type") != expected_type:
        raise jwt.InvalidTokenError("Unexpected token type")
    return payload
