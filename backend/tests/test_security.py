import jwt
import pytest

from app.core.security import create_token, decode_token, hash_password, verify_password


def test_password_hash_roundtrip() -> None:
    hashed = hash_password("rahasia-123")
    assert hashed != "rahasia-123"
    assert verify_password("rahasia-123", hashed)
    assert not verify_password("salah", hashed)


def test_token_type_is_enforced() -> None:
    token, jti, ttl = create_token("user-1", "refresh")
    assert decode_token(token, "refresh")["jti"] == jti
    assert ttl > 0
    with pytest.raises(jwt.InvalidTokenError):
        decode_token(token, "access")
