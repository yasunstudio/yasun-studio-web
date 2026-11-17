import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.models import Base, TimestampMixin, UUIDPrimaryKeyMixin


class LessonKind(enum.StrEnum):
    VIDEO = "video"
    ARTICLE = "article"
    QUIZ = "quiz"  # graded on the server; answers never leave the API
    EXERCISE = "exercise"  # coding exercise run in the browser (Pyodide / JS sandbox)


class CourseModule(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A section of a course (Bab). Ordered by `position`."""

    __tablename__ = "course_modules"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    position: Mapped[int] = mapped_column(Integer, default=0)

    lessons: Mapped[list[Lesson]] = relationship(
        back_populates="module",
        order_by="Lesson.position",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Lesson(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A single learning unit (Materi). `course_id` is denormalised for fast access checks."""

    __tablename__ = "lessons"
    __table_args__ = (UniqueConstraint("course_id", "slug"),)

    module_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course_modules.id", ondelete="CASCADE"), index=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(220))
    kind: Mapped[LessonKind] = mapped_column(
        Enum(LessonKind, name="lesson_kind", values_callable=lambda e: [m.value for m in e]),
        default=LessonKind.ARTICLE,
    )
    summary: Mapped[str] = mapped_column(String(300), default="")
    content: Mapped[str] = mapped_column(Text, default="")  # Markdown
    video_url: Mapped[str | None] = mapped_column(String(500))
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0)
    is_preview: Mapped[bool] = mapped_column(Boolean, default=False)
    position: Mapped[int] = mapped_column(Integer, default=0)

    # Rich learning design
    objectives: Mapped[list[str]] = mapped_column(
        ARRAY(String(200)), default=list, server_default="{}"
    )
    resources: Mapped[list[dict[str, str]]] = mapped_column(
        JSONB, default=list, server_default="[]"
    )
    quiz: Mapped[dict[str, object] | None] = mapped_column(JSONB)  # see schemas.QuizSpec
    exercise: Mapped[dict[str, object] | None] = mapped_column(JSONB)  # see schemas.ExerciseSpec

    module: Mapped[CourseModule] = relationship(back_populates="lessons")
