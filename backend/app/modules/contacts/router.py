import uuid

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, require_roles
from app.core.rate_limit import RateLimiter
from app.modules.contacts.schemas import ContactCreate, ContactRead, ContactUpdate
from app.modules.contacts.service import ContactService
from app.modules.users.models import UserRole
from app.shared.schemas import Message, Page, PageParams, page_params

public_router = APIRouter(prefix="/contact", tags=["contact"])
admin_router = APIRouter(
    prefix="/messages",
    tags=["admin · messages"],
    dependencies=[Depends(require_roles(UserRole.EDITOR))],
)


@public_router.post(
    "",
    response_model=Message,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(RateLimiter("contact", times=5, seconds=600))],
)
async def submit_contact(data: ContactCreate, db: DbSession) -> Message:
    await ContactService(db).submit(data)
    return Message(message="Terima kasih! Pesan Anda sudah kami terima.")


@admin_router.get("", response_model=Page[ContactRead])
async def list_messages(
    db: DbSession, params: PageParams = Depends(page_params), unread: bool | None = None
) -> Page[ContactRead]:
    return await ContactService(db).list(params, unread)


@admin_router.patch("/{msg_id}", response_model=ContactRead)
async def update_message(msg_id: uuid.UUID, data: ContactUpdate, db: DbSession) -> ContactRead:
    return ContactRead.model_validate(await ContactService(db).set_read(msg_id, data.is_read))


@admin_router.delete("/{msg_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(msg_id: uuid.UUID, db: DbSession) -> None:
    await ContactService(db).delete(msg_id)
