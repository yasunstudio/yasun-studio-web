import uuid
from typing import Any

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, require_roles
from app.modules.curriculum.schemas import (
    LessonCreate,
    LessonRead,
    LessonUpdate,
    ModuleCreate,
    ModuleOutline,
    ModuleUpdate,
    ReorderRequest,
)
from app.modules.curriculum.service import CurriculumService
from app.modules.users.models import UserRole

public_router = APIRouter(prefix="/courses", tags=["curriculum"])
admin_router = APIRouter(
    tags=["admin · curriculum"],
    dependencies=[Depends(require_roles(UserRole.EDITOR))],
)


@public_router.get("/{slug}/curriculum", response_model=list[ModuleOutline])
async def get_public_curriculum(slug: str, db: DbSession) -> Any:
    """Outline only — lesson content is served via the learner API with access checks."""
    return await CurriculumService(db).public_outline(slug)


# --- Admin -------------------------------------------------------------------
@admin_router.get("/courses/{course_id}/curriculum", response_model=list[ModuleOutline])
async def get_curriculum(course_id: uuid.UUID, db: DbSession) -> list[ModuleOutline]:
    return await CurriculumService(db).outline(course_id)


@admin_router.put("/courses/{course_id}/curriculum/order", response_model=list[ModuleOutline])
async def reorder_curriculum(
    course_id: uuid.UUID, data: ReorderRequest, db: DbSession
) -> list[ModuleOutline]:
    return await CurriculumService(db).reorder(course_id, data)


@admin_router.post(
    "/courses/{course_id}/modules",
    response_model=ModuleOutline,
    status_code=status.HTTP_201_CREATED,
)
async def create_module(course_id: uuid.UUID, data: ModuleCreate, db: DbSession) -> ModuleOutline:
    module = await CurriculumService(db).add_module(course_id, data)
    return ModuleOutline(id=module.id, title=module.title, position=module.position, lessons=[])


@admin_router.patch("/modules/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_module(module_id: uuid.UUID, data: ModuleUpdate, db: DbSession) -> None:
    await CurriculumService(db).update_module(module_id, data)


@admin_router.delete("/modules/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_module(module_id: uuid.UUID, db: DbSession) -> None:
    await CurriculumService(db).delete_module(module_id)


@admin_router.post(
    "/modules/{module_id}/lessons", response_model=LessonRead, status_code=status.HTTP_201_CREATED
)
async def create_lesson(module_id: uuid.UUID, data: LessonCreate, db: DbSession) -> LessonRead:
    return LessonRead.model_validate(await CurriculumService(db).add_lesson(module_id, data))


@admin_router.get("/lessons/{lesson_id}", response_model=LessonRead)
async def get_lesson(lesson_id: uuid.UUID, db: DbSession) -> LessonRead:
    return LessonRead.model_validate(await CurriculumService(db).get_lesson(lesson_id))


@admin_router.patch("/lessons/{lesson_id}", response_model=LessonRead)
async def update_lesson(lesson_id: uuid.UUID, data: LessonUpdate, db: DbSession) -> LessonRead:
    return LessonRead.model_validate(await CurriculumService(db).update_lesson(lesson_id, data))


@admin_router.delete("/lessons/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(lesson_id: uuid.UUID, db: DbSession) -> None:
    await CurriculumService(db).delete_lesson(lesson_id)
