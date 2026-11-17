import uuid
from typing import Literal, Self

from pydantic import Field, model_validator

from app.modules.curriculum.models import LessonKind
from app.shared.schemas import Schema


# --- Modules -----------------------------------------------------------------
class ModuleCreate(Schema):
    title: str = Field(min_length=2, max_length=200)


class ModuleUpdate(ModuleCreate):
    pass


# --- Rich lesson parts --------------------------------------------------------
class Resource(Schema):
    title: str = Field(min_length=2, max_length=120)
    url: str = Field(pattern=r"^https?://", max_length=500)
    kind: Literal["docs", "article", "video", "download", "tool"] = "docs"


class QuizOption(Schema):
    id: str = Field(min_length=1, max_length=20)
    text: str = Field(min_length=1, max_length=300)


class QuizQuestion(Schema):
    id: str = Field(min_length=1, max_length=20)
    prompt: str = Field(min_length=3, max_length=1000)  # Markdown
    multiple: bool = False  # True → checkboxes, all correct options required
    options: list[QuizOption] = Field(min_length=2, max_length=6)
    answer: list[str] = Field(min_length=1)
    explanation: str = Field(default="", max_length=1000)  # shown after submission

    @model_validator(mode="after")
    def _check(self) -> Self:
        ids = [o.id for o in self.options]
        if len(set(ids)) != len(ids):
            raise ValueError("ID opsi harus unik")
        if not set(self.answer) <= set(ids):
            raise ValueError("Jawaban harus merujuk ke ID opsi yang ada")
        if not self.multiple and len(self.answer) != 1:
            raise ValueError("Soal pilihan tunggal harus memiliki tepat satu jawaban")
        return self


class QuizSpec(Schema):
    pass_score: int = Field(default=70, ge=0, le=100)
    questions: list[QuizQuestion] = Field(min_length=1, max_length=30)

    @model_validator(mode="after")
    def _unique(self) -> Self:
        ids = [q.id for q in self.questions]
        if len(set(ids)) != len(ids):
            raise ValueError("ID soal harus unik")
        return self


class ExerciseSpec(Schema):
    language: Literal["python", "javascript"]
    instructions: str = Field(min_length=3, max_length=5000)  # Markdown
    starter_code: str = Field(default="", max_length=10_000)
    solution: str = Field(min_length=1, max_length=10_000)
    expected_output: str = Field(min_length=1, max_length=5000)  # stdout to match
    hints: list[str] = Field(default_factory=list, max_length=5)


# --- Lessons -----------------------------------------------------------------
class LessonBase(Schema):
    title: str = Field(min_length=2, max_length=200)
    kind: LessonKind = LessonKind.ARTICLE
    summary: str = Field(default="", max_length=300)
    content: str = ""
    video_url: str | None = Field(default=None, max_length=500)
    duration_minutes: int = Field(default=0, ge=0)
    is_preview: bool = False
    objectives: list[str] = Field(default_factory=list, max_length=8)
    resources: list[Resource] = Field(default_factory=list, max_length=10)
    quiz: QuizSpec | None = None
    exercise: ExerciseSpec | None = None

    @model_validator(mode="after")
    def _kind_payload(self) -> Self:
        if self.kind == LessonKind.QUIZ and self.quiz is None:
            raise ValueError("Materi kuis wajib memiliki soal")
        if self.kind == LessonKind.EXERCISE and self.exercise is None:
            raise ValueError("Materi latihan wajib memiliki spesifikasi latihan")
        return self


class LessonCreate(LessonBase):
    slug: str | None = Field(default=None, max_length=220)


class LessonUpdate(Schema):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    slug: str | None = Field(default=None, max_length=220)
    kind: LessonKind | None = None
    summary: str | None = Field(default=None, max_length=300)
    content: str | None = None
    video_url: str | None = Field(default=None, max_length=500)
    duration_minutes: int | None = Field(default=None, ge=0)
    is_preview: bool | None = None
    objectives: list[str] | None = Field(default=None, max_length=8)
    resources: list[Resource] | None = Field(default=None, max_length=10)
    quiz: QuizSpec | None = None
    exercise: ExerciseSpec | None = None


class LessonOutline(Schema):
    """Lesson metadata safe to expose publicly (no content)."""

    id: uuid.UUID
    title: str
    slug: str
    kind: LessonKind
    duration_minutes: int
    is_preview: bool
    position: int


class LessonRead(LessonOutline):
    """Full lesson for editors — includes quiz answers and exercise solutions."""

    module_id: uuid.UUID
    course_id: uuid.UUID
    summary: str
    content: str
    video_url: str | None
    objectives: list[str]
    resources: list[Resource]
    quiz: QuizSpec | None
    exercise: ExerciseSpec | None


# --- Learner-safe projections (no answers, no solutions) -------------------------
class PublicQuestion(Schema):
    id: str
    prompt: str
    multiple: bool
    options: list[QuizOption]


class PublicQuiz(Schema):
    pass_score: int
    questions: list[PublicQuestion]


class PublicExercise(Schema):
    language: Literal["python", "javascript"]
    instructions: str
    starter_code: str
    expected_output: str
    hints: list[str]


class LearnerLessonRead(LessonOutline):
    module_id: uuid.UUID
    summary: str
    content: str
    video_url: str | None
    objectives: list[str]
    resources: list[Resource]
    quiz: PublicQuiz | None
    exercise: PublicExercise | None


class ModuleOutline(Schema):
    id: uuid.UUID
    title: str
    position: int
    lessons: list[LessonOutline]


# --- Reorder -----------------------------------------------------------------
class ModuleOrder(Schema):
    id: uuid.UUID
    lesson_ids: list[uuid.UUID] = Field(default_factory=list)


class ReorderRequest(Schema):
    """Full desired order. Lessons may move between modules of the same course."""

    modules: list[ModuleOrder]
