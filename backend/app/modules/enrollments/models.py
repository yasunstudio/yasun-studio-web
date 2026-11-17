import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.modules.courses.models import Course
from app.modules.curriculum.models import LessonKind
from app.modules.users.models import User
from app.shared.models import Base, TimestampMixin, UUIDPrimaryKeyMixin


class EnrollmentStatus(enum.StrEnum):
    ACTIVE = "active"
    COMPLETED = "completed"


class Enrollment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A learner's access to a course. `created_at` = enrolment date."""

    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("user_id", "course_id"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), index=True
    )
    status: Mapped[EnrollmentStatus] = mapped_column(
        Enum(
            EnrollmentStatus,
            name="enrollment_status",
            values_callable=lambda e: [m.value for m in e],
        ),
        default=EnrollmentStatus.ACTIVE,
        index=True,
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_lesson_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="SET NULL")
    )
    last_accessed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    course: Mapped[Course] = relationship(lazy="joined")
    user: Mapped[User] = relationship(lazy="joined")


class LessonProgress(UUIDPrimaryKeyMixin, Base):
    """One row per lesson a learner has completed."""

    __tablename__ = "lesson_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id"),
        Index("ix_lesson_progress_user_course", "user_id", "course_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE")
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE")
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class LessonAttempt(UUIDPrimaryKeyMixin, Base):
    """Every graded quiz / exercise attempt — the audit trail behind a completion."""

    __tablename__ = "lesson_attempts"
    __table_args__ = (Index("ix_lesson_attempts_user_lesson", "user_id", "lesson_id"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE")
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), index=True
    )
    kind: Mapped[LessonKind] = mapped_column(
        Enum(
            LessonKind,
            name="lesson_kind",
            values_callable=lambda e: [m.value for m in e],
            create_type=False,
        )
    )
    score: Mapped[int] = mapped_column(Integer, default=0)  # 0..100
    passed: Mapped[bool] = mapped_column(Boolean, default=False)
    payload: Mapped[dict[str, object]] = mapped_column(JSONB, default=dict)  # answers / code
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LessonNote(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A learner's private notes for a lesson."""

    __tablename__ = "lesson_notes"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE")
    )
    content: Mapped[str] = mapped_column(Text, default="")
