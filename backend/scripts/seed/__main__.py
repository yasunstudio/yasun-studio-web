"""Seed the database with a complete, realistic demo dataset.

    python -m scripts.seed            # idempotent: admin always; sample data only on an empty DB
    python -m scripts.seed --reset    # dev only: wipe all app data, then seed from scratch

Sample data is deterministic (fixed RNG seed), so every developer sees the same dataset.
"""

import argparse
import asyncio
import math
import random
import sys
import uuid
from datetime import UTC, datetime, timedelta

import structlog
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app import models  # noqa: F401  (register all models)
from app.core.cache import invalidate
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.logging import configure_logging
from app.core.redis import redis_client
from app.core.security import hash_password
from app.modules.contacts.models import ContactMessage
from app.modules.courses.models import Course
from app.modules.curriculum.models import CourseModule, Lesson, LessonKind
from app.modules.curriculum.schemas import ExerciseSpec, QuizSpec
from app.modules.enrollments.models import (
    Enrollment,
    EnrollmentStatus,
    LessonAttempt,
    LessonProgress,
)
from app.modules.posts.models import Post, PostStatus
from app.modules.users.models import User, UserRole
from app.shared.utils import slugify
from scripts.seed import courses_engineering as eng
from scripts.seed import courses_programming as prog
from scripts.seed.assessments import EXERCISES, QUIZZES
from scripts.seed.enrichment import OBJECTIVES, RESOURCES
from scripts.seed.people import (
    DEMO_PASSWORD_LEARNER,
    DEMO_PASSWORD_STAFF,
    LEARNERS,
    MESSAGES,
    SITI_JOURNEY,
    STAFF,
)
from scripts.seed.posts import POSTS
from scripts.seed.types import CourseSeed

configure_logging()
log = structlog.get_logger("seed")

NOW = datetime.now(UTC)
COURSES: list[CourseSeed] = [
    prog.PYTHON,
    prog.JAVASCRIPT,
    eng.NEXTJS,
    eng.FASTAPI,
    prog.GIT,
    eng.SQL,
    eng.DOCKER,
    eng.AI,
    eng.DSA_DRAFT,
]
APP_TABLES = (
    "lesson_attempts, lesson_notes, lesson_progress, enrollments, lessons, course_modules, "
    "courses, posts, contact_messages, users"
)


def ago(days: float, hours: float = 0) -> datetime:
    return NOW - timedelta(days=days, hours=hours)


ALERT_LEADS = {"> **Latihan:**": "TIP", "> **Tantangan:**": "IMPORTANT"}


def with_alerts(md: str) -> str:
    """Turn '> **Latihan:** …' quotes into GitHub-style alert callouts."""
    out = []
    for line in md.splitlines():
        for lead, kind in ALERT_LEADS.items():
            if line.startswith(lead):
                out.append(f"> [!{kind}]")
                break
        out.append(line)
    return "\n".join(out)


def first_sentence(md: str) -> str:
    for line in md.splitlines():
        text = line.strip().lstrip("#>*-0123456789. ").strip()
        if text and not text.startswith(("```", "|", "[!")):
            return text[:290]
    return ""


def between(rng: random.Random, start: datetime, end: datetime) -> datetime:
    if end <= start:
        return start
    return start + (end - start) * rng.random()


# --------------------------------------------------------------------------- users
async def ensure_admin(db: AsyncSession) -> User:
    email = settings.FIRST_SUPERUSER_EMAIL.lower()
    admin = await db.scalar(select(User).where(User.email == email))
    if admin is None:
        admin = User(
            email=email,
            full_name="Yasun Admin",
            hashed_password=hash_password(settings.FIRST_SUPERUSER_PASSWORD),
            role=UserRole.ADMIN,
            created_at=ago(180),
        )
        db.add(admin)
        await db.flush()
        log.info("seed.admin_created", email=email)
    return admin


async def seed_people(db: AsyncSession) -> tuple[dict[str, User], list[User]]:
    # Hashing is deliberately slow (Argon2); hash each demo password once.
    staff_hash = hash_password(DEMO_PASSWORD_STAFF)
    learner_hash = hash_password(DEMO_PASSWORD_LEARNER)

    staff: dict[str, User] = {}
    for key, name, email, role, joined in STAFF:
        staff[key] = User(
            email=email,
            full_name=name,
            hashed_password=staff_hash,
            role=role,
            created_at=ago(joined),
        )
    learners = [
        User(
            email=email,
            full_name=name,
            hashed_password=learner_hash,
            role=UserRole.MEMBER,
            is_active=active,
            created_at=ago(joined, hours=joined % 7),
        )
        for name, email, joined, active in LEARNERS
    ]
    db.add_all([*staff.values(), *learners])
    await db.flush()
    return staff, learners


# ------------------------------------------------------------------------- courses
class CurriculumBuilder:
    """Tracks lesson order and per-course slug uniqueness while seeding one course."""

    def __init__(self, db: AsyncSession, course_id: uuid.UUID) -> None:
        self.db = db
        self.course_id = course_id
        self.ordered: list[Lesson] = []
        self._slugs: set[str] = set()
        self._position = 0

    async def module(self, title: str, position: int) -> CourseModule:
        module = CourseModule(course_id=self.course_id, title=title, position=position)
        self.db.add(module)
        await self.db.flush()
        self._position = 0
        return module

    def slug(self, title: str) -> str:
        slug, n = slugify(title), 2
        while slug in self._slugs:
            slug, n = f"{slugify(title)}-{n}", n + 1
        self._slugs.add(slug)
        return slug

    def add(self, lesson: Lesson) -> None:
        lesson.position = self._position
        self._position += 1
        self.db.add(lesson)
        self.ordered.append(lesson)


async def seed_courses(db: AsyncSession) -> dict[str, tuple[Course, list[Lesson]]]:
    out: dict[str, tuple[Course, list[Lesson]]] = {}
    for seed in COURSES:
        created = ago(seed.created_days_ago)
        course = Course(
            title=seed.title,
            slug=slugify(seed.title),
            summary=seed.summary,
            description=seed.description.strip(),
            category=seed.category,
            level=seed.level,
            tags=seed.tags,
            price=seed.price,
            is_featured=seed.is_featured,
            is_published=seed.is_published,
            created_at=created,
            updated_at=created + timedelta(days=min(5, seed.created_days_ago)),
        )
        db.add(course)
        await db.flush()

        build = CurriculumBuilder(db, course.id)
        for m_pos, (module_title, lessons) in enumerate(seed.modules):
            module = await build.module(module_title, m_pos)
            for l_idx, (title, kind, minutes, preview, content) in enumerate(lessons):
                body = with_alerts(content.strip())
                build.add(
                    Lesson(
                        module_id=module.id,
                        course_id=course.id,
                        title=title,
                        slug=build.slug(title),
                        kind=kind,
                        summary=first_sentence(body),
                        content=body,
                        video_url=seed.video if kind == LessonKind.VIDEO else None,
                        duration_minutes=minutes,
                        is_preview=preview,
                        objectives=OBJECTIVES.get(title, []),
                        # Official references on the first lesson of each chapter.
                        resources=RESOURCES.get(seed.title, []) if l_idx == 0 else [],
                    )
                )

            # Hands-on coding exercises, then the end-of-chapter quiz.
            for ex in EXERCISES.get((seed.title, m_pos), []):
                spec = {k: ex[k] for k in ExerciseSpec.model_fields}
                ExerciseSpec.model_validate(spec)
                build.add(
                    Lesson(
                        module_id=module.id,
                        course_id=course.id,
                        title=ex["title"],
                        slug=build.slug(ex["title"]),
                        kind=LessonKind.EXERCISE,
                        summary="Latihan coding interaktif — jalankan kodemu langsung di browser.",
                        content="",
                        duration_minutes=ex["minutes"],
                        objectives=["Menerapkan konsep bab ini dalam kode yang berjalan"],
                        exercise=spec,
                    )
                )
            if (seed.title, m_pos) in QUIZZES:
                q_title, q_minutes, pass_score, questions = QUIZZES[(seed.title, m_pos)]
                quiz = QuizSpec.model_validate({"pass_score": pass_score, "questions": questions})
                build.add(
                    Lesson(
                        module_id=module.id,
                        course_id=course.id,
                        title=q_title,
                        slug=build.slug(q_title),
                        kind=LessonKind.QUIZ,
                        summary=f"{len(questions)} soal · nilai minimum {pass_score}.",
                        content=(
                            "Uji pemahamanmu tentang bab ini. Kamu boleh mencoba berkali-kali; "
                            f"materi selesai setelah meraih nilai minimal **{pass_score}**."
                        ),
                        duration_minutes=q_minutes,
                        objectives=["Mengukur pemahaman materi bab ini"],
                        quiz=quiz.model_dump(),
                    )
                )
        await db.flush()
        course.lessons_count = len(build.ordered)
        course.duration_minutes = sum(lesson.duration_minutes for lesson in build.ordered)
        out[seed.title] = (course, build.ordered)
    log.info(
        "seed.courses_created",
        courses=len(out),
        lessons=sum(len(lessons) for _, lessons in out.values()),
    )
    return out


# --------------------------------------------------------------------------- posts
async def seed_posts(db: AsyncSession, authors: dict[str, User]) -> None:
    for title, excerpt, tags, status, author_key, days, content in POSTS:
        body = content.strip()
        db.add(
            Post(
                title=title,
                slug=slugify(title),
                excerpt=excerpt,
                content=body,
                tags=tags,
                status=status,
                author_id=authors[author_key].id,
                reading_minutes=max(1, math.ceil(len(body.split()) / 200)),
                published_at=ago(days) if status != PostStatus.DRAFT else None,
                created_at=ago(days + 1),
            )
        )
    log.info("seed.posts_created", count=len(POSTS))


# ---------------------------------------------------------------------- learning
def add_attempts(
    db: AsyncSession,
    rng: random.Random,
    user: User,
    course: Course,
    lesson: Lesson,
    passed_at: datetime,
) -> None:
    """Completed assessments are backed by a passing attempt (sometimes after a failed one)."""
    if lesson.kind == LessonKind.QUIZ:
        spec = QuizSpec.model_validate(lesson.quiz)
        correct = {q.id: q.answer for q in spec.questions}
        if rng.random() < 0.35:
            db.add(
                LessonAttempt(
                    user_id=user.id,
                    lesson_id=lesson.id,
                    course_id=course.id,
                    kind=LessonKind.QUIZ,
                    score=max(0, spec.pass_score - rng.choice([20, 30, 37])),
                    passed=False,
                    payload={"answers": {}},
                    created_at=passed_at - timedelta(minutes=rng.randint(5, 90)),
                )
            )
        db.add(
            LessonAttempt(
                user_id=user.id,
                lesson_id=lesson.id,
                course_id=course.id,
                kind=LessonKind.QUIZ,
                score=100,
                passed=True,
                payload={"answers": correct},
                created_at=passed_at,
            )
        )
    else:
        spec_ex = ExerciseSpec.model_validate(lesson.exercise)
        if rng.random() < 0.5:
            db.add(
                LessonAttempt(
                    user_id=user.id,
                    lesson_id=lesson.id,
                    course_id=course.id,
                    kind=LessonKind.EXERCISE,
                    score=0,
                    passed=False,
                    payload={"code": spec_ex.starter_code, "output": ""},
                    created_at=passed_at - timedelta(minutes=rng.randint(3, 40)),
                )
            )
        db.add(
            LessonAttempt(
                user_id=user.id,
                lesson_id=lesson.id,
                course_id=course.id,
                kind=LessonKind.EXERCISE,
                score=100,
                passed=True,
                payload={"code": spec_ex.solution, "output": spec_ex.expected_output},
                created_at=passed_at,
            )
        )


def enroll(
    db: AsyncSession,
    rng: random.Random,
    user: User,
    course: Course,
    lessons: list[Lesson],
    fraction: float,
    enrolled: datetime,
    last_access: datetime,
) -> int:
    """Create an enrolment whose progress is internally consistent (lessons completed in order)."""
    done = round(fraction * len(lessons))
    stamps = sorted(between(rng, enrolled, last_access) for _ in range(done))
    for lesson, at in zip(lessons[:done], stamps, strict=True):
        db.add(
            LessonProgress(
                user_id=user.id, lesson_id=lesson.id, course_id=course.id, completed_at=at
            )
        )
        if lesson.kind in (LessonKind.QUIZ, LessonKind.EXERCISE):
            add_attempts(db, rng, user, course, lesson, at)
    finished = bool(lessons) and done == len(lessons)
    current = lessons[min(done, len(lessons) - 1)] if done or last_access > enrolled else None
    db.add(
        Enrollment(
            user_id=user.id,
            course_id=course.id,
            status=EnrollmentStatus.COMPLETED if finished else EnrollmentStatus.ACTIVE,
            completed_at=stamps[-1] if finished else None,
            last_lesson_id=current.id if current else None,
            last_accessed_at=last_access if done or current else None,
            created_at=enrolled,
        )
    )
    return done


async def seed_learning(
    db: AsyncSession,
    rng: random.Random,
    learners: list[User],
    catalog: dict[str, tuple[Course, list[Lesson]]],
) -> None:
    # Only free, published courses can be enrolled until payments ship (phase 2).
    free = [(c, ls) for c, ls in catalog.values() if c.is_published and c.price == 0]
    enrollments = progress_rows = 0

    for user in learners:
        if user.email == "siti@example.com":
            for title, (fraction, enrolled_days, access_days) in SITI_JOURNEY.items():
                course, lessons = catalog[title]
                progress_rows += enroll(
                    db, rng, user, course, lessons, fraction, ago(enrolled_days), ago(access_days)
                )
                enrollments += 1
            continue

        joined = user.created_at
        picks = rng.sample(free, k=rng.choice([1, 1, 2, 2, 3, 4]))
        for course, lessons in picks:
            enrolled = between(rng, max(joined, course.created_at), ago(0.5))
            fraction = rng.choices(
                [0.0, 0.15, 0.3, 0.5, 0.7, 0.85, 1.0], weights=[2, 3, 3, 3, 2, 2, 3]
            )[0]
            if not user.is_active:
                fraction = min(fraction, 0.3)
            last_access = between(rng, enrolled, NOW - timedelta(hours=1))
            progress_rows += enroll(db, rng, user, course, lessons, fraction, enrolled, last_access)
            enrollments += 1
    log.info("seed.learning_created", enrollments=enrollments, completed_lessons=progress_rows)


async def seed_messages(db: AsyncSession) -> None:
    for name, email, subject, message, days, is_read in MESSAGES:
        db.add(
            ContactMessage(
                name=name,
                email=email,
                subject=subject,
                message=message,
                is_read=is_read,
                created_at=ago(days, hours=3),
            )
        )
    log.info("seed.messages_created", count=len(MESSAGES))


# ---------------------------------------------------------------------------- main
async def main(reset: bool) -> None:
    if reset and settings.is_production:
        sys.exit("Refusing to --reset in production.")

    async with SessionLocal() as db:
        if reset:
            await db.execute(text(f"TRUNCATE {APP_TABLES} RESTART IDENTITY CASCADE"))
            async for key in redis_client.scan_iter("auth:refresh:*"):
                await redis_client.delete(key)
            log.warning("seed.reset_done")

        admin = await ensure_admin(db)

        if not settings.SEED_SAMPLE_DATA:
            await db.commit()
            return
        if await db.scalar(select(func.count(Course.id))):
            log.info("seed.sample_data_exists", hint="use --reset to rebuild the demo dataset")
            await db.commit()
            return

        rng = random.Random(2026)
        staff, learners = await seed_people(db)
        catalog = await seed_courses(db)
        await seed_posts(db, {"admin": admin, **staff})
        await seed_learning(db, rng, learners, catalog)
        await seed_messages(db)
        await db.commit()

    await invalidate("courses", "posts", "dashboard")
    log.info(
        "seed.done",
        learners=len(learners),
        staff=len(staff) + 1,
        demo_learner="siti@example.com",
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reset", action="store_true", help="wipe app data first (dev only)")
    asyncio.run(main(parser.parse_args().reset))
