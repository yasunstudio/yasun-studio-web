import enum

from sqlalchemy import Boolean, Enum, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.models import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CourseLevel(enum.StrEnum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class Course(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "courses"

    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    summary: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(60), index=True)
    level: Mapped[CourseLevel] = mapped_column(
        Enum(CourseLevel, name="course_level", values_callable=lambda e: [m.value for m in e]),
        default=CourseLevel.BEGINNER,
    )
    tags: Mapped[list[str]] = mapped_column(ARRAY(String(40)), default=list)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0)
    lessons_count: Mapped[int] = mapped_column(Integer, default=0)
    price: Mapped[int] = mapped_column(Integer, default=0)  # IDR; 0 = gratis
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
