"""Typed shapes for seed content (keeps the data files declarative)."""

from dataclasses import dataclass, field

from app.modules.courses.models import CourseLevel as L
from app.modules.curriculum.models import LessonKind

V = LessonKind.VIDEO
A = LessonKind.ARTICLE

# (title, kind, minutes, is_preview, markdown content)
LessonSeed = tuple[str, LessonKind, int, bool, str]
ModuleSeed = tuple[str, list[LessonSeed]]


@dataclass(frozen=True)
class CourseSeed:
    title: str
    summary: str
    category: str
    level: L
    tags: list[str]
    price: int
    is_featured: bool
    description: str
    modules: list[ModuleSeed]
    video: str | None = None
    created_days_ago: int = 60
    is_published: bool = True
    extra: dict[str, object] = field(default_factory=dict)


__all__ = ["A", "CourseSeed", "L", "LessonSeed", "ModuleSeed", "V"]
