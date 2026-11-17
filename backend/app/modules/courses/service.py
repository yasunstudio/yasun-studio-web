import uuid
from typing import Any

from sqlalchemy import ColumnElement, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cached, invalidate
from app.core.exceptions import ConflictError, NotFoundError
from app.modules.courses.models import Course, CourseLevel
from app.modules.courses.repository import CourseRepository
from app.modules.courses.schemas import CourseCreate, CourseListItem, CourseRead, CourseUpdate
from app.shared.schemas import Page, PageParams
from app.shared.utils import slugify

CACHE_NS = "courses"


class CourseService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = CourseRepository(session)

    # --- Public (cached) -----------------------------------------------------
    async def list_public(
        self,
        params: PageParams,
        *,
        q: str | None = None,
        category: str | None = None,
        level: CourseLevel | None = None,
        featured: bool | None = None,
    ) -> Any:
        key = f"list:{params.page}:{params.size}:{q}:{category}:{level}:{featured}"
        return await cached(
            CACHE_NS,
            key,
            lambda: self._list(
                params, q=q, category=category, level=level, featured=featured, published_only=True
            ),
        )

    async def get_public(self, slug: str) -> Any:
        async def load() -> CourseRead:
            course = await self.repo.get_by(slug=slug, is_published=True)
            if not course:
                raise NotFoundError("Kelas tidak ditemukan")
            return CourseRead.model_validate(course)

        return await cached(CACHE_NS, f"detail:{slug}", load)

    # --- Admin ---------------------------------------------------------------
    async def list_admin(self, params: PageParams, q: str | None = None) -> Page[CourseListItem]:
        return await self._list(params, q=q, published_only=False)

    async def get(self, course_id: uuid.UUID) -> Course:
        course = await self.repo.get(course_id)
        if not course:
            raise NotFoundError("Kelas tidak ditemukan")
        return course

    async def create(self, data: CourseCreate) -> Course:
        slug = slugify(data.slug or data.title)
        await self._ensure_unique_slug(slug)
        course = await self.repo.create(**data.model_dump(exclude={"slug"}), slug=slug)
        await invalidate(CACHE_NS, "dashboard")
        return course

    async def update(self, course_id: uuid.UUID, data: CourseUpdate) -> Course:
        course = await self.get(course_id)
        payload = data.model_dump(exclude_unset=True)
        if payload.get("slug"):
            payload["slug"] = slugify(payload["slug"])
            if payload["slug"] != course.slug:
                await self._ensure_unique_slug(payload["slug"])
        course = await self.repo.update(course, **payload)
        await invalidate(CACHE_NS, "dashboard")
        return course

    async def delete(self, course_id: uuid.UUID) -> None:
        await self.repo.delete(await self.get(course_id))
        await invalidate(CACHE_NS, "dashboard")

    # --- Internals -----------------------------------------------------------
    async def _list(
        self,
        params: PageParams,
        *,
        q: str | None = None,
        category: str | None = None,
        level: CourseLevel | None = None,
        featured: bool | None = None,
        published_only: bool,
    ) -> Page[CourseListItem]:
        where: list[ColumnElement[bool]] = []
        if published_only:
            where.append(Course.is_published.is_(True))
        if q:
            like = f"%{q}%"
            where.append(or_(Course.title.ilike(like), Course.summary.ilike(like)))
        if category:
            where.append(Course.category == category)
        if level:
            where.append(Course.level == level)
        if featured is not None:
            where.append(Course.is_featured.is_(featured))
        rows, total = await self.repo.paginate(
            offset=params.offset,
            limit=params.size,
            where=where,
            # Public catalogue promotes featured courses; admin lists are chronological.
            order_by=(
                [Course.is_featured.desc(), Course.created_at.desc()]
                if published_only
                else [Course.created_at.desc()]
            ),
        )
        return Page.create([CourseListItem.model_validate(r) for r in rows], total, params)

    async def _ensure_unique_slug(self, slug: str) -> None:
        if await self.repo.get_by(slug=slug):
            raise ConflictError("Slug sudah digunakan", details={"field": "slug"})
