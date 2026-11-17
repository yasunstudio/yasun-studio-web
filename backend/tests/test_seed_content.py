"""Guards the seeded learning content: every quiz/exercise is valid and solvable."""

import shutil
import subprocess

import pytest

from app.modules.curriculum.schemas import ExerciseSpec, QuizSpec, Resource
from app.modules.enrollments.assessment import normalize_output
from scripts.seed.__main__ import COURSES
from scripts.seed.assessments import EXERCISES, QUIZZES
from scripts.seed.enrichment import OBJECTIVES, RESOURCES

ALL_EXERCISES = [ex for exs in EXERCISES.values() for ex in exs]
TITLES = {c.title: c for c in COURSES}


def test_quizzes_are_valid_and_attached_to_real_modules() -> None:
    for (course, module_idx), (_title, _min, pass_score, questions) in QUIZZES.items():
        assert course in TITLES, course
        assert module_idx < len(TITLES[course].modules)
        QuizSpec.model_validate({"pass_score": pass_score, "questions": questions})


def test_every_published_module_has_a_quiz() -> None:
    for c in COURSES:
        if c.is_published:
            for i in range(len(c.modules)):
                assert (c.title, i) in QUIZZES, f"missing quiz: {c.title} module {i}"


def test_objectives_and_resources_reference_existing_content() -> None:
    lesson_titles = {lesson[0] for c in COURSES for _, ls in c.modules for lesson in ls}
    assert set(OBJECTIVES) <= lesson_titles, set(OBJECTIVES) - lesson_titles
    for course, items in RESOURCES.items():
        assert course in TITLES
        for r in items:
            Resource.model_validate(r)


@pytest.mark.parametrize("ex", ALL_EXERCISES, ids=lambda e: e["title"])
def test_exercise_solution_produces_expected_output(ex: dict[str, object]) -> None:
    spec = ExerciseSpec.model_validate(ex)
    runner = {"python": "python3", "javascript": "node"}[spec.language]
    if shutil.which(runner) is None:
        pytest.skip(f"{runner} not installed")
    flag = "-c" if spec.language == "python" else "-e"
    out = subprocess.run([runner, flag, spec.solution], capture_output=True, text=True, timeout=20)
    assert out.returncode == 0, out.stderr
    assert normalize_output(out.stdout) == normalize_output(spec.expected_output)
    # The starter code must NOT already pass.
    start = subprocess.run(
        [runner, flag, spec.starter_code], capture_output=True, text=True, timeout=20
    )
    assert normalize_output(start.stdout) != normalize_output(spec.expected_output)
