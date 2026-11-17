import uuid

from fastapi import APIRouter, Depends, status

from app.api.deps import CurrentUser, DbSession, require_roles
from app.core.rate_limit import RateLimiter
from app.modules.enrollments.assessment import AssessmentService
from app.modules.enrollments.schemas import (
    AdminEnrollment,
    EnrollmentRead,
    EnrollRequest,
    ExerciseResult,
    ExerciseSubmission,
    LearnerCourse,
    LessonView,
    NoteRead,
    NoteUpdate,
    ProgressResult,
    QuizResult,
    QuizSubmission,
    SolutionRead,
)
from app.modules.enrollments.service import EnrollmentService
from app.modules.users.models import UserRole
from app.shared.schemas import Page, PageParams, page_params

# Learner API — any authenticated, active account.
me_router = APIRouter(prefix="/me", tags=["learning"])
admin_router = APIRouter(
    prefix="/enrollments",
    tags=["admin · enrollments"],
    dependencies=[Depends(require_roles(UserRole.EDITOR))],
)


@me_router.get("/enrollments", response_model=list[EnrollmentRead])
async def my_enrollments(user: CurrentUser, db: DbSession) -> list[EnrollmentRead]:
    return await EnrollmentService(db).my_enrollments(user)


@me_router.post("/enrollments", response_model=EnrollmentRead, status_code=status.HTTP_201_CREATED)
async def enroll(data: EnrollRequest, user: CurrentUser, db: DbSession) -> EnrollmentRead:
    """Free courses: instant access. Paid courses: 402 until payments (phase 2)."""
    return await EnrollmentService(db).enroll(user, data.course_slug)


@me_router.get("/courses/{slug}", response_model=LearnerCourse)
async def learner_course(slug: str, user: CurrentUser, db: DbSession) -> LearnerCourse:
    return await EnrollmentService(db).learner_course(user, slug)


@me_router.get("/courses/{slug}/lessons/{lesson_slug}", response_model=LessonView)
async def lesson_view(slug: str, lesson_slug: str, user: CurrentUser, db: DbSession) -> LessonView:
    return await EnrollmentService(db).lesson_view(user, slug, lesson_slug)


@me_router.put("/lessons/{lesson_id}/complete", response_model=ProgressResult)
async def complete_lesson(lesson_id: uuid.UUID, user: CurrentUser, db: DbSession) -> ProgressResult:
    return await EnrollmentService(db).set_completed(user, lesson_id, True)


@me_router.delete("/lessons/{lesson_id}/complete", response_model=ProgressResult)
async def uncomplete_lesson(
    lesson_id: uuid.UUID, user: CurrentUser, db: DbSession
) -> ProgressResult:
    return await EnrollmentService(db).set_completed(user, lesson_id, False)


# --- Assessments & notes -------------------------------------------------------
_attempt_limit = Depends(RateLimiter("attempt", times=30, seconds=60))


@me_router.post(
    "/lessons/{lesson_id}/quiz/attempts", response_model=QuizResult, dependencies=[_attempt_limit]
)
async def submit_quiz(
    lesson_id: uuid.UUID, data: QuizSubmission, user: CurrentUser, db: DbSession
) -> QuizResult:
    return await AssessmentService(db).submit_quiz(user, lesson_id, data)


@me_router.post(
    "/lessons/{lesson_id}/exercise/attempts",
    response_model=ExerciseResult,
    dependencies=[_attempt_limit],
)
async def submit_exercise(
    lesson_id: uuid.UUID, data: ExerciseSubmission, user: CurrentUser, db: DbSession
) -> ExerciseResult:
    return await AssessmentService(db).submit_exercise(user, lesson_id, data)


@me_router.get("/lessons/{lesson_id}/exercise/solution", response_model=SolutionRead)
async def exercise_solution(lesson_id: uuid.UUID, user: CurrentUser, db: DbSession) -> SolutionRead:
    return await AssessmentService(db).exercise_solution(user, lesson_id)


@me_router.get("/lessons/{lesson_id}/note", response_model=NoteRead)
async def get_note(lesson_id: uuid.UUID, user: CurrentUser, db: DbSession) -> NoteRead:
    return await AssessmentService(db).get_note(user, lesson_id)


@me_router.put("/lessons/{lesson_id}/note", response_model=NoteRead)
async def save_note(
    lesson_id: uuid.UUID, data: NoteUpdate, user: CurrentUser, db: DbSession
) -> NoteRead:
    return await AssessmentService(db).save_note(user, lesson_id, data.content)


@admin_router.get("", response_model=Page[AdminEnrollment])
async def list_enrollments(
    db: DbSession,
    params: PageParams = Depends(page_params),
    course_id: uuid.UUID | None = None,
    q: str | None = None,
) -> Page[AdminEnrollment]:
    return await EnrollmentService(db).admin_list(params, course_id=course_id, q=q)
