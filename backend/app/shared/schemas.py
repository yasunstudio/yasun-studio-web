"""Shared Pydantic schemas: base config and pagination."""

import math
from typing import Annotated

from fastapi import Query
from pydantic import BaseModel, ConfigDict


class Schema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PageParams(BaseModel):
    page: int = 1
    size: int = 12

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size


def page_params(
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 12,
) -> PageParams:
    return PageParams(page=page, size=size)


class Page[T](Schema):
    items: list[T]
    total: int
    page: int
    size: int
    pages: int

    @classmethod
    def create(cls, items: list[T], total: int, params: PageParams) -> Page[T]:
        return cls(
            items=items,
            total=total,
            page=params.page,
            size=params.size,
            pages=math.ceil(total / params.size) if params.size else 0,
        )


class Message(Schema):
    message: str
