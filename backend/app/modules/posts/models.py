import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.modules.users.models import User
from app.shared.models import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PostStatus(enum.StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Post(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "posts"

    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    excerpt: Mapped[str] = mapped_column(String(300))
    content: Mapped[str] = mapped_column(Text, default="")  # Markdown
    cover_url: Mapped[str | None] = mapped_column(String(500))
    tags: Mapped[list[str]] = mapped_column(ARRAY(String(40)), default=list)
    reading_minutes: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[PostStatus] = mapped_column(
        Enum(PostStatus, name="post_status", values_callable=lambda e: [m.value for m in e]),
        default=PostStatus.DRAFT,
        index=True,
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    author: Mapped[User | None] = relationship(lazy="joined")
