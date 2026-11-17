import uuid

from sqlalchemy import ColumnElement
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import invalidate
from app.core.exceptions import NotFoundError
from app.modules.contacts.models import ContactMessage
from app.modules.contacts.schemas import ContactCreate, ContactRead
from app.shared.repository import BaseRepository
from app.shared.schemas import Page, PageParams


class ContactRepository(BaseRepository[ContactMessage]):
    model = ContactMessage


class ContactService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = ContactRepository(session)

    async def submit(self, data: ContactCreate) -> ContactMessage:
        msg = await self.repo.create(**data.model_dump())
        await invalidate("dashboard")
        return msg

    async def list(self, params: PageParams, unread: bool | None = None) -> Page[ContactRead]:
        where: list[ColumnElement[bool]] = []
        if unread is not None:
            where.append(ContactMessage.is_read.is_(not unread))
        rows, total = await self.repo.paginate(
            offset=params.offset,
            limit=params.size,
            where=where,
            order_by=[ContactMessage.created_at.desc()],
        )
        return Page.create([ContactRead.model_validate(r) for r in rows], total, params)

    async def set_read(self, msg_id: uuid.UUID, is_read: bool) -> ContactMessage:
        msg = await self._get(msg_id)
        msg = await self.repo.update(msg, is_read=is_read)
        await invalidate("dashboard")
        return msg

    async def delete(self, msg_id: uuid.UUID) -> None:
        await self.repo.delete(await self._get(msg_id))
        await invalidate("dashboard")

    async def _get(self, msg_id: uuid.UUID) -> ContactMessage:
        msg = await self.repo.get(msg_id)
        if not msg:
            raise NotFoundError("Pesan tidak ditemukan")
        return msg
