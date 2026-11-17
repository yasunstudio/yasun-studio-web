from pydantic import EmailStr, Field

from app.modules.users.schemas import UserRead
from app.shared.schemas import Schema


class LoginRequest(Schema):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RegisterRequest(Schema):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RefreshRequest(Schema):
    refresh_token: str


class TokenPair(Schema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead
