import uuid
from datetime import datetime

from pydantic import EmailStr, Field

from app.shared.schemas import Schema


class ContactCreate(Schema):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=10, max_length=5000)


class ContactUpdate(Schema):
    is_read: bool


class ContactRead(ContactCreate):
    id: uuid.UUID
    is_read: bool
    created_at: datetime
