"""Learning domain: enrolment, lesson access control, and progress.

Progress is *derived* (completed lessons ÷ current lessons in course) rather
than stored, so it stays correct when editors add or remove lessons.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import ColumnElement, delete, func, or_, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import invalidate
from app.core.exceptions import AppError, ConflictError, ForbiddenError, NotFoundError
from app.modules.courses.models import Course
from app.modules.curriculum.models import CourseModule, Lesson, LessonKind
from app.modules.curriculum.schemas import LearnerLessonRead, PublicExercise, PublicQuiz
from app.modules.enrollments.models import (
    Enrollment,
    EnrollmentStatus,
    LessonAttempt,
    LessonNote,
    LessonProgress,
)
from app.modules.enrollments.schemas import (
    AdminEnrollment,
    AssessmentState,
    EnrollmentRead,
    LearnerCourse,
    LearnerCourseInfo,
    LearnerLesson,
    LearnerModule,
    LessonNav,
    LessonView,
    ProgressResult,
)
from app.modules.users.models import User
from app.shared.schemas import Page, PageParams


class PaymentRequiredError(AppError):
    status_code = 402
    code = "payment_required"


ASSESSED_KINDS = (LessonKind.QUIZ, LessonKind.EXERCISE)
SOLUTION_UNLOCK_ATTEMPTS = 2


def _percent(done: int, total: int) -> int:
    return min(100, round(done * 100 / total)) if total else 0


def learner_lesson(lesson: Lesson) -> LearnerLessonRead:
    """Project a lesson for learners: quiz answers and exercise solutions are stripped."""
    quiz = PublicQuiz.model_validate(lesson.quiz) if lesson.quiz else None
    exercise = PublicExercise.model_validate(lesson.exercise) if lesson.exercise else None
    return LearnerLessonRead.model_validate(lesson).model_copy(
        update={"quiz": quiz, "exercise": exercise}
    )


class EnrollmentService:
    def __init__(self, session: AsyncSession) -> None:
        self.db = session

    # --- Enrol ---------------------------------------------------------------
    async def enroll(self, user: User, course_slug: str) -> EnrollmentRead:
        course = await self._published_course(course_slug)
        existing = await self._enrollment(user.id, course.id)
        if existing:
            return await self._read(existing)
        if course.price > 0:
            raise PaymentRequiredError(
                "Kelas ini berbayar. Pembayaran online segera hadir — hubungi kami untuk mendaftar."
            )
        enrollment = Enrollment(user_id=user.id, course_id=course.id)
        self.db.add(enrollment)
        await self.db.flush()
        await self.db.refresh(enrollment)
        await invalidate("dashboard")
        return await self._read(enrollment)

    # --- Learner views -------------------------------------------------------
    async def my_enrollments(self, user: User) -> list[EnrollmentRead]:
        rows = (
            await self.db.scalars(
                select(Enrollment)
                .where(Enrollment.user_id == user.id)
                .order_by(
                    Enrollment.last_accessed_at.desc().nulls_last(), Enrollment.created_at.desc()
                )
            )
        ).all()
        done = await self._completed_counts(user.id, [e.course_id for e in rows])
        return [self._to_read(e, done.get(e.course_id, 0)) for e in rows]

    async def learner_course(self, user: User, course_slug: str) -> LearnerCourse:
        course = await self._published_course(course_slug)
        enrollment = await self._enrollment(user.id, course.id)
        completed = await self._completed_ids(user.id, course.id) if enrollment else set()
        modules = [
            LearnerModule(
                id=m.id,
                title=m.title,
                position=m.position,
                lessons=[
                    LearnerLesson.model_validate(lesson).model_copy(
                        update={"completed": lesson.id in completed}
                    )
                    for lesson in m.lessons
                ],
            )
            for m in await self._modules(course.id)
        ]
        return LearnerCourse(
            course=LearnerCourseInfo.model_validate(course),
            description=course.description,
            enrollment=self._to_read(enrollment, len(completed)) if enrollment else None,
            modules=modules,
        )

    async def lesson_view(self, user: User, course_slug: str, lesson_slug: str) -> LessonView:
        course = await self._published_course(course_slug)
        modules = await self._modules(course.id)
        ordered = [(m, lesson) for m in modules for lesson in m.lessons]
        index = next((i for i, (_, x) in enumerate(ordered) if x.slug == lesson_slug), None)
        if index is None:
            raise NotFoundError("Materi tidak ditemukan")
        module, lesson = ordered[index]

        enrollment = await self._enrollment(user.id, course.id)
        if not enrollment and not lesson.is_preview:
            raise ForbiddenError("Daftar ke kelas ini untuk membuka materi.")

        completed = False
        note = ""
        assessment = AssessmentState()
        if enrollment:
            enrollment.last_lesson_id = lesson.id
            enrollment.last_accessed_at = datetime.now(UTC)
            completed = lesson.id in await self._completed_ids(user.id, course.id)
            note = (
                await self.db.scalar(
                    select(LessonNote.content).where(
                        LessonNote.user_id == user.id, LessonNote.lesson_id == lesson.id
                    )
                )
            ) or ""
            if lesson.kind in ASSESSED_KINDS:
                assessment = await self.assessment_state(user.id, lesson.id, completed)

        def nav(i: int) -> LessonNav | None:
            if 0 <= i < len(ordered):
                item = ordered[i][1]
                return LessonNav(slug=item.slug, title=item.title)
            return None

        return LessonView(
            course=LearnerCourseInfo.model_validate(course),
            module_title=module.title,
            lesson=learner_lesson(lesson),
            enrolled=enrollment is not None,
            completed=completed,
            note=note,
            assessment=assessment,
            prev=nav(index - 1),
            next=nav(index + 1),
        )

    async def assessment_state(
        self, user_id: uuid.UUID, lesson_id: uuid.UUID, completed: bool
    ) -> AssessmentState:
        attempts, best, passed = (
            await self.db.execute(
                select(
                    func.count(LessonAttempt.id),
                    func.max(LessonAttempt.score),
                    func.bool_or(LessonAttempt.passed),
                ).where(LessonAttempt.user_id == user_id, LessonAttempt.lesson_id == lesson_id)
            )
        ).one()
        return AssessmentState(
            attempts=int(attempts),
            best_score=best,
            passed=bool(passed),
            solution_unlocked=completed or int(attempts) >= SOLUTION_UNLOCK_ATTEMPTS,
        )

    async def set_completed(
        self, user: User, lesson_id: uuid.UUID, done: bool, *, verified: bool = False
    ) -> ProgressResult:
        """Mark a lesson (un)completed.

        Quiz/exercise lessons can only be completed by passing them (`verified=True` is
        passed by the assessment service) or when a passing attempt already exists.
        """
        lesson = await self.db.get(Lesson, lesson_id)
        if not lesson:
            raise NotFoundError("Materi tidak ditemukan")
        enrollment = await self._enrollment(user.id, lesson.course_id)
        if not enrollment:
            raise ForbiddenError("Daftar ke kelas ini terlebih dahulu.")
        if done and not verified and lesson.kind in ASSESSED_KINDS:
            has_pass = await self.db.scalar(
                select(LessonAttempt.id)
                .where(
                    LessonAttempt.user_id == user.id,
                    LessonAttempt.lesson_id == lesson.id,
                    LessonAttempt.passed.is_(True),
                )
                .limit(1)
            )
            if not has_pass:
                raise ConflictError(
                    "Selesaikan kuis/latihan ini dengan lulus untuk menandai selesai."
                )

        if done:
            await self.db.execute(
                insert(LessonProgress)
                .values(
                    id=uuid.uuid7(),
                    user_id=user.id,
                    lesson_id=lesson.id,
                    course_id=lesson.course_id,
                )
                .on_conflict_do_nothing(index_elements=["user_id", "lesson_id"])
            )
        else:
            await self.db.execute(
                delete(LessonProgress).where(
                    LessonProgress.user_id == user.id, LessonProgress.lesson_id == lesson.id
                )
            )

        total = await self.db.scalar(
            select(func.count(Lesson.id)).where(Lesson.course_id == lesson.course_id)
        )
        completed = len(await self._completed_ids(user.id, lesson.course_id))
        progress = _percent(completed, int(total or 0))

        if progress == 100 and enrollment.status != EnrollmentStatus.COMPLETED:
            enrollment.status = EnrollmentStatus.COMPLETED
            enrollment.completed_at = datetime.now(UTC)
        elif progress < 100 and enrollment.status == EnrollmentStatus.COMPLETED:
            enrollment.status = EnrollmentStatus.ACTIVE
            enrollment.completed_at = None
        await self.db.flush()

        return ProgressResult(
            completed=done,
            completed_lessons=completed,
            progress=progress,
            course_completed=enrollment.status == EnrollmentStatus.COMPLETED,
        )

    # --- Admin ---------------------------------------------------------------
    async def admin_list(
        self, params: PageParams, *, course_id: uuid.UUID | None, q: str | None
    ) -> Page[AdminEnrollment]:
        where: list[ColumnElement[bool]] = []
        base = select(Enrollment).join(Enrollment.user)
        if course_id:
            where.append(Enrollment.course_id == course_id)
        if q:
            like = f"%{q}%"
            where.append(or_(User.full_name.ilike(like), User.email.ilike(like)))
        stmt = base.where(*where)
        total = await self.db.scalar(select(func.count()).select_from(stmt.subquery()))
        rows = (
            (
                await self.db.scalars(
                    stmt.order_by(Enrollment.created_at.desc())
                    .offset(params.offset)
                    .limit(params.size)
                )
            )
            .unique()
            .all()
        )

        counts = await self._completed_counts_many([(e.user_id, e.course_id) for e in rows])
        items = []
        for e in rows:
            done = counts.get((e.user_id, e.course_id), 0)
            items.append(
                AdminEnrollment.model_validate(e).model_copy(
                    update={
                        "completed_lessons": done,
                        "progress": _percent(done, e.course.lessons_count),
                    }
                )
            )
        return Page.create(items, int(total or 0), params)

    # --- Internals -----------------------------------------------------------
    async def _read(self, enrollment: Enrollment) -> EnrollmentRead:
        done = len(await self._completed_ids(enrollment.user_id, enrollment.course_id))
        return self._to_read(enrollment, done)

    @staticmethod
    def _to_read(enrollment: Enrollment, done: int) -> EnrollmentRead:
        return EnrollmentRead.model_validate(enrollment).model_copy(
            update={
                "completed_lessons": done,
                "progress": _percent(done, enrollment.course.lessons_count),
            }
        )

    async def _published_course(self, slug: str) -> Course:
        course = await self.db.scalar(
            select(Course).where(Course.slug == slug, Course.is_published.is_(True))
        )
        if not course:
            raise NotFoundError("Kelas tidak ditemukan")
        return course

    async def _enrollment(self, user_id: uuid.UUID, course_id: uuid.UUID) -> Enrollment | None:
        return await self.db.scalar(
            select(Enrollment).where(
                Enrollment.user_id == user_id, Enrollment.course_id == course_id
            )
        )

    async def _modules(self, course_id: uuid.UUID) -> list[CourseModule]:
        stmt = (
            select(CourseModule)
            .where(CourseModule.course_id == course_id)
            .order_by(CourseModule.position, CourseModule.created_at)
        )
        return list((await self.db.scalars(stmt)).all())

    async def _completed_ids(self, user_id: uuid.UUID, course_id: uuid.UUID) -> set[uuid.UUID]:
        rows = await self.db.scalars(
            select(LessonProgress.lesson_id).where(
                LessonProgress.user_id == user_id, LessonProgress.course_id == course_id
            )
        )
        return set(rows.all())

    async def _completed_counts(
        self, user_id: uuid.UUID, course_ids: list[uuid.UUID]
    ) -> dict[uuid.UUID, int]:
        if not course_ids:
            return {}
        rows = await self.db.execute(
            select(LessonProgress.course_id, func.count())
            .where(LessonProgress.user_id == user_id, LessonProgress.course_id.in_(course_ids))
            .group_by(LessonProgress.course_id)
        )
        return {cid: int(n) for cid, n in rows.all()}

    async def _completed_counts_many(
        self, pairs: list[tuple[uuid.UUID, uuid.UUID]]
    ) -> dict[tuple[uuid.UUID, uuid.UUID], int]:
        if not pairs:
            return {}
        user_ids = {u for u, _ in pairs}
        course_ids = {c for _, c in pairs}
        rows = await self.db.execute(
            select(LessonProgress.user_id, LessonProgress.course_id, func.count())
            .where(LessonProgress.user_id.in_(user_ids), LessonProgress.course_id.in_(course_ids))
            .group_by(LessonProgress.user_id, LessonProgress.course_id)
        )
        return {(u, c): int(n) for u, c, n in rows.all()}
