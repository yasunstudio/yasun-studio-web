"""Curriculum: modules (bab) and lessons (materi) of a course.

Course aggregates (`lessons_count`, `duration_minutes`) are derived here after
every change, so the catalogue never drifts from the real curriculum.
"""

import uuid
from typing import Any

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cached, invalidate
from app.core.exceptions import AppError, NotFoundError
from app.modules.courses.models import Course
from app.modules.curriculum.models import CourseModule, Lesson, LessonKind
from app.modules.curriculum.schemas import (
    LessonCreate,
    LessonUpdate,
    ModuleCreate,
    ModuleOutline,
    ModuleUpdate,
    ReorderRequest,
)
from app.shared.utils import slugify

CACHE_NS = "courses"


class CurriculumService:
    def __init__(self, session: AsyncSession) -> None:
        self.db = session

    # --- Reads ---------------------------------------------------------------
    async def modules(self, course_id: uuid.UUID) -> list[CourseModule]:
        stmt = (
            select(CourseModule)
            .where(CourseModule.course_id == course_id)
            .order_by(CourseModule.position, CourseModule.created_at)
        )
        return list((await self.db.scalars(stmt)).all())

    async def outline(self, course_id: uuid.UUID) -> list[ModuleOutline]:
        return [ModuleOutline.model_validate(m) for m in await self.modules(course_id)]

    async def public_outline(self, slug: str) -> Any:
        async def load() -> list[dict[str, Any]]:
            course = await self._published_course(slug)
            return [m.model_dump(mode="json") for m in await self.outline(course.id)]

        return await cached(CACHE_NS, f"curriculum:{slug}", load)

    async def get_lesson(self, lesson_id: uuid.UUID) -> Lesson:
        lesson = await self.db.get(Lesson, lesson_id)
        if not lesson:
            raise NotFoundError("Materi tidak ditemukan")
        return lesson

    # --- Modules -------------------------------------------------------------
    async def add_module(self, course_id: uuid.UUID, data: ModuleCreate) -> CourseModule:
        await self._course(course_id)
        position = await self._next_position(CourseModule, CourseModule.course_id == course_id)
        module = CourseModule(course_id=course_id, title=data.title, position=position)
        self.db.add(module)
        await self.db.flush()
        await self.db.refresh(module)
        await invalidate(CACHE_NS)
        return module

    async def update_module(self, module_id: uuid.UUID, data: ModuleUpdate) -> CourseModule:
        module = await self._module(module_id)
        module.title = data.title
        await self.db.flush()
        await invalidate(CACHE_NS)
        return module

    async def delete_module(self, module_id: uuid.UUID) -> None:
        module = await self._module(module_id)
        course_id = module.course_id
        await self.db.delete(module)
        await self.db.flush()
        await self._recompute(course_id)

    # --- Lessons -------------------------------------------------------------
    async def add_lesson(self, module_id: uuid.UUID, data: LessonCreate) -> Lesson:
        module = await self._module(module_id)
        slug = await self._unique_slug(module.course_id, data.slug or data.title)
        position = await self._next_position(Lesson, Lesson.module_id == module_id)
        lesson = Lesson(
            **data.model_dump(exclude={"slug"}),
            slug=slug,
            module_id=module.id,
            course_id=module.course_id,
            position=position,
        )
        self.db.add(lesson)
        await self.db.flush()
        await self.db.refresh(lesson)
        await self._recompute(module.course_id)
        return lesson

    async def update_lesson(self, lesson_id: uuid.UUID, data: LessonUpdate) -> Lesson:
        lesson = await self.get_lesson(lesson_id)
        payload = data.model_dump(exclude_unset=True)
        if payload.get("slug") and slugify(payload["slug"]) != lesson.slug:
            payload["slug"] = await self._unique_slug(lesson.course_id, payload["slug"])
        else:
            payload.pop("slug", None)
        for field, value in payload.items():
            setattr(lesson, field, value)
        if lesson.kind == LessonKind.QUIZ and not lesson.quiz:
            raise AppError("Materi kuis wajib memiliki soal")
        if lesson.kind == LessonKind.EXERCISE and not lesson.exercise:
            raise AppError("Materi latihan wajib memiliki spesifikasi latihan")
        await self.db.flush()
        await self.db.refresh(lesson)
        await self._recompute(lesson.course_id)
        return lesson

    async def delete_lesson(self, lesson_id: uuid.UUID) -> None:
        lesson = await self.get_lesson(lesson_id)
        course_id = lesson.course_id
        await self.db.delete(lesson)
        await self.db.flush()
        await self._recompute(course_id)

    async def reorder(self, course_id: uuid.UUID, data: ReorderRequest) -> list[ModuleOutline]:
        modules = {m.id: m for m in await self.modules(course_id)}
        lessons = {
            lesson.id: lesson
            for lesson in (
                await self.db.scalars(select(Lesson).where(Lesson.course_id == course_id))
            ).all()
        }
        requested_modules = [m.id for m in data.modules]
        requested_lessons = [lid for m in data.modules for lid in m.lesson_ids]
        if set(requested_modules) != set(modules) or sorted(map(str, requested_lessons)) != sorted(
            map(str, lessons)
        ):
            raise AppError("Urutan tidak valid: daftar bab/materi tidak lengkap atau asing")

        for m_pos, order in enumerate(data.modules):
            modules[order.id].position = m_pos
            for l_pos, lesson_id in enumerate(order.lesson_ids):
                lessons[lesson_id].module_id = order.id
                lessons[lesson_id].position = l_pos
        await self.db.flush()
        self.db.expire_all()
        await invalidate(CACHE_NS)
        return await self.outline(course_id)

    # --- Internals -----------------------------------------------------------
    async def _recompute(self, course_id: uuid.UUID) -> None:
        count, minutes = (
            await self.db.execute(
                select(
                    func.count(Lesson.id), func.coalesce(func.sum(Lesson.duration_minutes), 0)
                ).where(Lesson.course_id == course_id)
            )
        ).one()
        await self.db.execute(
            update(Course)
            .where(Course.id == course_id)
            .values(lessons_count=count, duration_minutes=minutes)
        )
        await invalidate(CACHE_NS, "dashboard")

    async def _next_position(self, model: Any, *where: Any) -> int:
        current = await self.db.scalar(select(func.max(model.position)).where(*where))
        return 0 if current is None else int(current) + 1

    async def _unique_slug(self, course_id: uuid.UUID, value: str) -> str:
        base = slugify(value) or "materi"
        slug, n = base, 2
        while await self.db.scalar(
            select(Lesson.id).where(Lesson.course_id == course_id, Lesson.slug == slug)
        ):
            slug, n = f"{base}-{n}", n + 1
        return slug

    async def _course(self, course_id: uuid.UUID) -> Course:
        course = await self.db.get(Course, course_id)
        if not course:
            raise NotFoundError("Kelas tidak ditemukan")
        return course

    async def _published_course(self, slug: str) -> Course:
        course = await self.db.scalar(
            select(Course).where(Course.slug == slug, Course.is_published.is_(True))
        )
        if not course:
            raise NotFoundError("Kelas tidak ditemukan")
        return course

    async def _module(self, module_id: uuid.UUID) -> CourseModule:
        module = await self.db.get(CourseModule, module_id)
        if not module:
            raise NotFoundError("Bab tidak ditemukan")
        return module
