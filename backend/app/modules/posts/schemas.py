import uuid
from datetime import datetime

from pydantic import Field

from app.modules.posts.models import PostStatus
from app.shared.schemas import Schema


class PostAuthor(Schema):
    id: uuid.UUID
    full_name: str


class PostBase(Schema):
    title: str = Field(min_length=3, max_length=200)
    excerpt: str = Field(min_length=10, max_length=300)
    content: str = ""
    cover_url: str | None = None
    tags: list[str] = Field(default_factory=list, max_length=10)
    status: PostStatus = PostStatus.DRAFT


class PostCreate(PostBase):
    slug: str | None = Field(default=None, max_length=220)


class PostUpdate(Schema):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    slug: str | None = Field(default=None, max_length=220)
    excerpt: str | None = Field(default=None, min_length=10, max_length=300)
    content: str | None = None
    cover_url: str | None = None
    tags: list[str] | None = None
    status: PostStatus | None = None


class PostListItem(Schema):
    id: uuid.UUID
    title: str
    slug: str
    excerpt: str
    cover_url: str | None
    tags: list[str]
    reading_minutes: int
    status: PostStatus
    published_at: datetime | None
    author: PostAuthor | None
    created_at: datetime


class PostRead(PostListItem):
    content: str
    updated_at: datetime
