from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import func, select

from app.api.deps import DbSession, require_roles
from app.core.cache import cached
from app.modules.contacts.models import ContactMessage
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment
from app.modules.posts.models import Post, PostStatus
from app.modules.users.models import User, UserRole
from app.shared.schemas import Schema

router = APIRouter(
    prefix="/dashboard",
    tags=["admin · dashboard"],
    dependencies=[Depends(require_roles(UserRole.EDITOR))],
)


class DashboardStats(Schema):
    courses_total: int
    courses_published: int
    posts_total: int
    posts_published: int
    messages_unread: int
    users_total: int
    learners_total: int
    enrollments_total: int


@router.get("/stats", response_model=DashboardStats)
async def stats(db: DbSession) -> Any:
    async def load() -> DashboardStats:
        def count(model: Any, *where: Any) -> Any:
            return select(func.count()).select_from(model).where(*where).scalar_subquery()

        row = (
            await db.execute(
                select(
                    count(Course).label("courses_total"),
                    count(Course, Course.is_published.is_(True)).label("courses_published"),
                    count(Post).label("posts_total"),
                    count(Post, Post.status == PostStatus.PUBLISHED).label("posts_published"),
                    count(ContactMessage, ContactMessage.is_read.is_(False)).label(
                        "messages_unread"
                    ),
                    count(User).label("users_total"),
                    count(User, User.role == UserRole.MEMBER).label("learners_total"),
                    count(Enrollment).label("enrollments_total"),
                )
            )
        ).one()
        return DashboardStats.model_validate(row._asdict())

    return await cached("dashboard", "stats", load, ttl=60)
