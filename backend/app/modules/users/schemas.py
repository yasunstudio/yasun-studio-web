import uuid
from datetime import datetime

from pydantic import EmailStr, Field

from app.modules.users.models import UserRole
from app.shared.schemas import Schema


class UserBase(Schema):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    role: UserRole = UserRole.MEMBER
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(Schema):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    role: UserRole | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class ProfileUpdate(Schema):
    full_name: str = Field(min_length=2, max_length=120)


class PasswordChange(Schema):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime
