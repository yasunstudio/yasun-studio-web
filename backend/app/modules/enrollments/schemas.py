import uuid
from datetime import datetime

from pydantic import Field

from app.modules.courses.models import CourseLevel
from app.modules.curriculum.schemas import LearnerLessonRead, LessonOutline
from app.modules.enrollments.models import EnrollmentStatus
from app.shared.schemas import Schema


class EnrollRequest(Schema):
    course_slug: str


class LearnerCourseInfo(Schema):
    id: uuid.UUID
    title: str
    slug: str
    summary: str
    category: str
    level: CourseLevel
    thumbnail_url: str | None
    lessons_count: int
    duration_minutes: int
    price: int


class EnrollmentRead(Schema):
    id: uuid.UUID
    status: EnrollmentStatus
    created_at: datetime
    completed_at: datetime | None
    last_accessed_at: datetime | None
    last_lesson_id: uuid.UUID | None
    course: LearnerCourseInfo
    completed_lessons: int = 0
    progress: int = 0  # 0..100


class LearnerLesson(LessonOutline):
    completed: bool = False


class LearnerModule(Schema):
    id: uuid.UUID
    title: str
    position: int
    lessons: list[LearnerLesson]


class LearnerCourse(Schema):
    course: LearnerCourseInfo
    description: str
    enrollment: EnrollmentRead | None
    modules: list[LearnerModule]


class LessonNav(Schema):
    slug: str
    title: str


class AssessmentState(Schema):
    attempts: int = 0
    best_score: int | None = None
    passed: bool = False
    solution_unlocked: bool = False


class LessonView(Schema):
    course: LearnerCourseInfo
    module_title: str
    lesson: LearnerLessonRead
    enrolled: bool
    completed: bool
    note: str = ""
    assessment: AssessmentState = AssessmentState()
    prev: LessonNav | None
    next: LessonNav | None


class ProgressResult(Schema):
    completed: bool
    completed_lessons: int
    progress: int
    course_completed: bool


class AdminEnrollmentUser(Schema):
    id: uuid.UUID
    full_name: str
    email: str


class AdminEnrollmentCourse(Schema):
    id: uuid.UUID
    title: str
    slug: str


class AdminEnrollment(Schema):
    id: uuid.UUID
    status: EnrollmentStatus
    created_at: datetime
    completed_at: datetime | None
    last_accessed_at: datetime | None
    user: AdminEnrollmentUser
    course: AdminEnrollmentCourse
    completed_lessons: int = 0
    progress: int = 0


# --- Assessments & notes -----------------------------------------------------
class QuizSubmission(Schema):
    answers: dict[str, list[str]] = Field(max_length=30)


class QuestionResult(Schema):
    question_id: str
    correct: bool
    selected: list[str]
    answer: list[str]
    explanation: str


class QuizResult(Schema):
    score: int
    passed: bool
    pass_score: int
    correct_count: int
    total: int
    results: list[QuestionResult]
    attempts: int
    progress: ProgressResult | None = None


class ExerciseSubmission(Schema):
    code: str = Field(max_length=10_000)
    output: str = Field(max_length=10_000)


class ExerciseResult(Schema):
    passed: bool
    attempts: int
    solution_unlocked: bool
    progress: ProgressResult | None = None


class SolutionRead(Schema):
    solution: str


class NoteUpdate(Schema):
    content: str = Field(max_length=10_000)


class NoteRead(NoteUpdate):
    pass
