"""Generic async repository: the only layer that talks SQL."""

import uuid
from collections.abc import Sequence
from typing import Any

from sqlalchemy import ColumnElement, Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.models import Base


class BaseRepository[ModelT: Base]:
    model: type[ModelT]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # --- Reads ---------------------------------------------------------------
    async def get(self, id_: uuid.UUID) -> ModelT | None:
        return await self.session.get(self.model, id_)

    async def get_by(self, **filters: Any) -> ModelT | None:
        stmt = select(self.model).filter_by(**filters).limit(1)
        return (await self.session.scalars(stmt)).first()

    async def paginate(
        self,
        *,
        offset: int,
        limit: int,
        where: Sequence[ColumnElement[bool]] = (),
        order_by: Sequence[Any] = (),
        base: Select[tuple[ModelT]] | None = None,
    ) -> tuple[list[ModelT], int]:
        stmt = base if base is not None else select(self.model)
        if where:
            stmt = stmt.where(*where)
        total = await self.session.scalar(select(func.count()).select_from(stmt.subquery()))
        rows = await self.session.scalars(stmt.order_by(*order_by).offset(offset).limit(limit))
        return list(rows.all()), int(total or 0)

    async def count(self, *where: ColumnElement[bool]) -> int:
        stmt = select(func.count()).select_from(self.model)
        if where:
            stmt = stmt.where(*where)
        return int(await self.session.scalar(stmt) or 0)

    # --- Writes --------------------------------------------------------------
    async def create(self, **data: Any) -> ModelT:
        obj = self.model(**data)
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def update(self, obj: ModelT, **data: Any) -> ModelT:
        for field, value in data.items():
            setattr(obj, field, value)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def delete(self, obj: ModelT) -> None:
        await self.session.delete(obj)
        await self.session.flush()
