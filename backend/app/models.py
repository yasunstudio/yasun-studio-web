"""Model registry — import every model so Alembic sees full metadata."""

from app.modules.contacts.models import ContactMessage
from app.modules.courses.models import Course
from app.modules.curriculum.models import CourseModule, Lesson
from app.modules.enrollments.models import Enrollment, LessonAttempt, LessonNote, LessonProgress
from app.modules.posts.models import Post
from app.modules.users.models import User
from app.shared.models import Base

__all__ = [
    "Base",
    "ContactMessage",
    "Course",
    "CourseModule",
    "Enrollment",
    "Lesson",
    "LessonAttempt",
    "LessonNote",
    "LessonProgress",
    "Post",
    "User",
]
