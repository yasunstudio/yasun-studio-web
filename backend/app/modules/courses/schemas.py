import uuid
from datetime import datetime

from pydantic import Field

from app.modules.courses.models import CourseLevel
from app.shared.schemas import Schema


class CourseBase(Schema):
    title: str = Field(min_length=3, max_length=200)
    summary: str = Field(min_length=10, max_length=300)
    description: str = ""
    category: str = Field(min_length=2, max_length=60)
    level: CourseLevel = CourseLevel.BEGINNER
    tags: list[str] = Field(default_factory=list, max_length=10)
    thumbnail_url: str | None = None
    price: int = Field(default=0, ge=0)
    is_featured: bool = False
    is_published: bool = False


class CourseCreate(CourseBase):
    slug: str | None = Field(default=None, max_length=220)


class CourseUpdate(Schema):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    slug: str | None = Field(default=None, max_length=220)
    summary: str | None = Field(default=None, min_length=10, max_length=300)
    description: str | None = None
    category: str | None = None
    level: CourseLevel | None = None
    tags: list[str] | None = None
    thumbnail_url: str | None = None
    price: int | None = Field(default=None, ge=0)
    is_featured: bool | None = None
    is_published: bool | None = None


class CourseListItem(Schema):
    id: uuid.UUID
    title: str
    slug: str
    summary: str
    category: str
    level: CourseLevel
    tags: list[str]
    thumbnail_url: str | None
    duration_minutes: int
    lessons_count: int
    price: int
    is_featured: bool
    is_published: bool
    created_at: datetime


class CourseRead(CourseListItem):
    description: str
    updated_at: datetime
