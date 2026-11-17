import uuid
from typing import Any

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, StaffUser, require_roles
from app.modules.posts.schemas import PostCreate, PostListItem, PostRead, PostUpdate
from app.modules.posts.service import PostService
from app.modules.users.models import UserRole
from app.shared.schemas import Page, PageParams, page_params

public_router = APIRouter(prefix="/posts", tags=["posts"])
admin_router = APIRouter(
    prefix="/posts",
    tags=["admin · posts"],
    dependencies=[Depends(require_roles(UserRole.EDITOR))],
)


@public_router.get("", response_model=Page[PostListItem])
async def list_posts(
    db: DbSession,
    params: PageParams = Depends(page_params),
    q: str | None = None,
    tag: str | None = None,
) -> Any:
    return await PostService(db).list_public(params, q=q, tag=tag)


@public_router.get("/{slug}", response_model=PostRead)
async def get_post(slug: str, db: DbSession) -> Any:
    return await PostService(db).get_public(slug)


@admin_router.get("", response_model=Page[PostListItem])
async def admin_list_posts(
    db: DbSession, params: PageParams = Depends(page_params), q: str | None = None
) -> Page[PostListItem]:
    return await PostService(db).list_admin(params, q)


@admin_router.get("/{post_id}", response_model=PostRead)
async def admin_get_post(post_id: uuid.UUID, db: DbSession) -> PostRead:
    return PostRead.model_validate(await PostService(db).get(post_id))


@admin_router.post("", response_model=PostRead, status_code=status.HTTP_201_CREATED)
async def create_post(data: PostCreate, db: DbSession, user: StaffUser) -> PostRead:
    return PostRead.model_validate(await PostService(db).create(data, author_id=user.id))


@admin_router.patch("/{post_id}", response_model=PostRead)
async def update_post(post_id: uuid.UUID, data: PostUpdate, db: DbSession) -> PostRead:
    return PostRead.model_validate(await PostService(db).update(post_id, data))


@admin_router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: uuid.UUID, db: DbSession) -> None:
    await PostService(db).delete(post_id)
