import uuid

from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.core.security import hash_password
from app.modules.users.models import User
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserCreate, UserRead, UserUpdate
from app.shared.schemas import Page, PageParams


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = UserRepository(session)

    async def list(self, params: PageParams, q: str | None = None) -> Page[UserRead]:
        where = []
        if q:
            like = f"%{q}%"
            where.append(or_(User.email.ilike(like), User.full_name.ilike(like)))
        rows, total = await self.repo.paginate(
            offset=params.offset, limit=params.size, where=where, order_by=[User.created_at.desc()]
        )
        return Page.create([UserRead.model_validate(r) for r in rows], total, params)

    async def get(self, user_id: uuid.UUID) -> User:
        user = await self.repo.get(user_id)
        if not user:
            raise NotFoundError("Pengguna tidak ditemukan")
        return user

    async def create(self, data: UserCreate) -> User:
        if await self.repo.get_by_email(data.email):
            raise ConflictError("Email sudah terdaftar")
        payload = data.model_dump(exclude={"password"})
        payload["email"] = data.email.lower()
        return await self.repo.create(**payload, hashed_password=hash_password(data.password))

    async def update(self, user_id: uuid.UUID, data: UserUpdate) -> User:
        user = await self.get(user_id)
        payload = data.model_dump(exclude_unset=True, exclude={"password"})
        if data.password:
            payload["hashed_password"] = hash_password(data.password)
        return await self.repo.update(user, **payload)

    async def delete(self, user_id: uuid.UUID) -> None:
        await self.repo.delete(await self.get(user_id))
