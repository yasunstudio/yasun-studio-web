import uuid
from typing import Any

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, require_roles
from app.modules.courses.models import CourseLevel
from app.modules.courses.schemas import CourseCreate, CourseListItem, CourseRead, CourseUpdate
from app.modules.courses.service import CourseService
from app.modules.users.models import UserRole
from app.shared.schemas import Page, PageParams, page_params

public_router = APIRouter(prefix="/courses", tags=["courses"])
admin_router = APIRouter(
    prefix="/courses",
    tags=["admin · courses"],
    dependencies=[Depends(require_roles(UserRole.EDITOR))],
)


@public_router.get("", response_model=Page[CourseListItem])
async def list_courses(
    db: DbSession,
    params: PageParams = Depends(page_params),
    q: str | None = None,
    category: str | None = None,
    level: CourseLevel | None = None,
    featured: bool | None = None,
) -> Any:
    return await CourseService(db).list_public(
        params, q=q, category=category, level=level, featured=featured
    )


@public_router.get("/{slug}", response_model=CourseRead)
async def get_course(slug: str, db: DbSession) -> Any:
    return await CourseService(db).get_public(slug)


@admin_router.get("", response_model=Page[CourseListItem])
async def admin_list_courses(
    db: DbSession, params: PageParams = Depends(page_params), q: str | None = None
) -> Page[CourseListItem]:
    return await CourseService(db).list_admin(params, q)


@admin_router.get("/{course_id}", response_model=CourseRead)
async def admin_get_course(course_id: uuid.UUID, db: DbSession) -> CourseRead:
    return CourseRead.model_validate(await CourseService(db).get(course_id))


@admin_router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
async def create_course(data: CourseCreate, db: DbSession) -> CourseRead:
    return CourseRead.model_validate(await CourseService(db).create(data))


@admin_router.patch("/{course_id}", response_model=CourseRead)
async def update_course(course_id: uuid.UUID, data: CourseUpdate, db: DbSession) -> CourseRead:
    return CourseRead.model_validate(await CourseService(db).update(course_id, data))


@admin_router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(course_id: uuid.UUID, db: DbSession) -> None:
    await CourseService(db).delete(course_id)
