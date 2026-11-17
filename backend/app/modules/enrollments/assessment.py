"""Assessments (quizzes & coding exercises) and private lesson notes.

Integrity rules
- Quiz answer keys never leave the server: learners submit choices, the API grades.
- Every attempt is stored (`lesson_attempts`) — the audit trail behind a completion.
- Passing an assessment completes the lesson; quiz/exercise lessons cannot be
  completed manually without a passing attempt (see EnrollmentService.set_completed).
- Exercises run in the learner's browser (Pyodide / JS sandbox); the server verifies
  the reported stdout against the expected output. Server-side sandboxed execution
  is a planned upgrade for graded certifications.
"""

import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError, ForbiddenError, NotFoundError
from app.modules.curriculum.models import Lesson, LessonKind
from app.modules.curriculum.schemas import ExerciseSpec, QuizSpec
from app.modules.enrollments.models import Enrollment, LessonAttempt, LessonNote
from app.modules.enrollments.schemas import (
    ExerciseResult,
    ExerciseSubmission,
    NoteRead,
    QuestionResult,
    QuizResult,
    QuizSubmission,
    SolutionRead,
)
from app.modules.enrollments.service import EnrollmentService
from app.modules.users.models import User


def normalize_output(text: str) -> str:
    """Compare program output leniently: trailing spaces and blank edges don't matter."""
    return "\n".join(line.rstrip() for line in text.strip().splitlines())


class AssessmentService:
    def __init__(self, session: AsyncSession) -> None:
        self.db = session
        self.learning = EnrollmentService(session)

    # --- Quiz ----------------------------------------------------------------
    async def submit_quiz(
        self, user: User, lesson_id: uuid.UUID, data: QuizSubmission
    ) -> QuizResult:
        lesson = await self._enrolled_lesson(user, lesson_id, LessonKind.QUIZ)
        spec = QuizSpec.model_validate(lesson.quiz)

        results: list[QuestionResult] = []
        for q in spec.questions:
            selected = sorted(set(data.answers.get(q.id, [])))
            correct = selected == sorted(q.answer)
            results.append(
                QuestionResult(
                    question_id=q.id,
                    correct=correct,
                    selected=selected,
                    answer=sorted(q.answer),
                    explanation=q.explanation,
                )
            )
        correct_count = sum(r.correct for r in results)
        score = round(correct_count * 100 / len(results))
        passed = score >= spec.pass_score

        self.db.add(
            LessonAttempt(
                user_id=user.id,
                lesson_id=lesson.id,
                course_id=lesson.course_id,
                kind=LessonKind.QUIZ,
                score=score,
                passed=passed,
                payload={"answers": {r.question_id: r.selected for r in results}},
            )
        )
        await self.db.flush()
        progress = (
            await self.learning.set_completed(user, lesson.id, True, verified=True)
            if passed
            else None
        )
        state = await self.learning.assessment_state(user.id, lesson.id, passed)
        return QuizResult(
            score=score,
            passed=passed,
            pass_score=spec.pass_score,
            correct_count=correct_count,
            total=len(results),
            results=results,
            attempts=state.attempts,
            progress=progress,
        )

    # --- Exercise ------------------------------------------------------------
    async def submit_exercise(
        self, user: User, lesson_id: uuid.UUID, data: ExerciseSubmission
    ) -> ExerciseResult:
        lesson = await self._enrolled_lesson(user, lesson_id, LessonKind.EXERCISE)
        spec = ExerciseSpec.model_validate(lesson.exercise)
        passed = normalize_output(data.output) == normalize_output(spec.expected_output)

        self.db.add(
            LessonAttempt(
                user_id=user.id,
                lesson_id=lesson.id,
                course_id=lesson.course_id,
                kind=LessonKind.EXERCISE,
                score=100 if passed else 0,
                passed=passed,
                payload={"code": data.code, "output": data.output[:2000]},
            )
        )
        await self.db.flush()
        progress = (
            await self.learning.set_completed(user, lesson.id, True, verified=True)
            if passed
            else None
        )
        state = await self.learning.assessment_state(user.id, lesson.id, passed)
        return ExerciseResult(
            passed=passed,
            attempts=state.attempts,
            solution_unlocked=state.solution_unlocked,
            progress=progress,
        )

    async def exercise_solution(self, user: User, lesson_id: uuid.UUID) -> SolutionRead:
        lesson = await self._enrolled_lesson(user, lesson_id, LessonKind.EXERCISE)
        completed = lesson.id in await self.learning._completed_ids(user.id, lesson.course_id)
        state = await self.learning.assessment_state(user.id, lesson.id, completed)
        if not state.solution_unlocked:
            raise ForbiddenError(
                "Solusi terbuka setelah 2 kali mencoba atau setelah latihan lulus."
            )
        return SolutionRead(solution=ExerciseSpec.model_validate(lesson.exercise).solution)

    # --- Notes ---------------------------------------------------------------
    async def get_note(self, user: User, lesson_id: uuid.UUID) -> NoteRead:
        await self._enrolled_lesson(user, lesson_id)
        content = await self.db.scalar(
            select(LessonNote.content).where(
                LessonNote.user_id == user.id, LessonNote.lesson_id == lesson_id
            )
        )
        return NoteRead(content=content or "")

    async def save_note(self, user: User, lesson_id: uuid.UUID, content: str) -> NoteRead:
        await self._enrolled_lesson(user, lesson_id)
        if not content.strip():
            await self.db.execute(
                delete(LessonNote).where(
                    LessonNote.user_id == user.id, LessonNote.lesson_id == lesson_id
                )
            )
            return NoteRead(content="")
        note = await self.db.scalar(
            select(LessonNote).where(
                LessonNote.user_id == user.id, LessonNote.lesson_id == lesson_id
            )
        )
        if note:
            note.content = content
        else:
            self.db.add(LessonNote(user_id=user.id, lesson_id=lesson_id, content=content))
        await self.db.flush()
        return NoteRead(content=content)

    # --- Internals -----------------------------------------------------------
    async def _enrolled_lesson(
        self, user: User, lesson_id: uuid.UUID, kind: LessonKind | None = None
    ) -> Lesson:
        lesson = await self.db.get(Lesson, lesson_id)
        if not lesson:
            raise NotFoundError("Materi tidak ditemukan")
        if kind and lesson.kind != kind:
            raise AppError("Jenis materi tidak sesuai")
        enrolled = await self.db.scalar(
            select(Enrollment.id).where(
                Enrollment.user_id == user.id, Enrollment.course_id == lesson.course_id
            )
        )
        if not enrolled:
            raise ForbiddenError("Daftar ke kelas ini terlebih dahulu.")
        return lesson
