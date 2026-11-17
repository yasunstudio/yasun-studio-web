import uuid

from fastapi import APIRouter, Depends, status

from app.api.deps import CurrentUser, DbSession, require_roles
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.rate_limit import RateLimiter
from app.core.security import hash_password, verify_password
from app.modules.users.models import UserRole
from app.modules.users.schemas import (
    PasswordChange,
    ProfileUpdate,
    UserCreate,
    UserRead,
    UserUpdate,
)
from app.modules.users.service import UserService
from app.shared.schemas import Page, PageParams, page_params

me_router = APIRouter(prefix="/users", tags=["users"])
admin_router = APIRouter(
    prefix="/users",
    tags=["admin · users"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


@me_router.get("/me", response_model=UserRead)
async def read_me(user: CurrentUser) -> UserRead:
    return UserRead.model_validate(user)


@me_router.patch("/me", response_model=UserRead)
async def update_me(data: ProfileUpdate, user: CurrentUser, db: DbSession) -> UserRead:
    user.full_name = data.full_name
    await db.flush()
    return UserRead.model_validate(user)


@me_router.post(
    "/me/password",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(RateLimiter("password", times=5, seconds=600))],
)
async def change_password(data: PasswordChange, user: CurrentUser, db: DbSession) -> None:
    if not verify_password(data.current_password, user.hashed_password):
        raise UnauthorizedError("Kata sandi saat ini salah")
    user.hashed_password = hash_password(data.new_password)
    await db.flush()


@admin_router.get("", response_model=Page[UserRead])
async def list_users(
    db: DbSession, params: PageParams = Depends(page_params), q: str | None = None
) -> Page[UserRead]:
    return await UserService(db).list(params, q)


@admin_router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(data: UserCreate, db: DbSession) -> UserRead:
    return UserRead.model_validate(await UserService(db).create(data))


@admin_router.patch("/{user_id}", response_model=UserRead)
async def update_user(user_id: uuid.UUID, data: UserUpdate, db: DbSession) -> UserRead:
    return UserRead.model_validate(await UserService(db).update(user_id, data))


@admin_router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: uuid.UUID, db: DbSession, current: CurrentUser) -> None:
    if user_id == current.id:
        raise ForbiddenError("Tidak dapat menghapus akun sendiri")
    await UserService(db).delete(user_id)
