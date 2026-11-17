import math
import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import ColumnElement, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cached, invalidate
from app.core.exceptions import ConflictError, NotFoundError
from app.modules.posts.models import Post, PostStatus
from app.modules.posts.repository import PostRepository
from app.modules.posts.schemas import PostCreate, PostListItem, PostRead, PostUpdate
from app.shared.schemas import Page, PageParams
from app.shared.utils import slugify

CACHE_NS = "posts"
WORDS_PER_MINUTE = 200


def _reading_minutes(content: str) -> int:
    return max(1, math.ceil(len(content.split()) / WORDS_PER_MINUTE))


class PostService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = PostRepository(session)

    # --- Public (cached) -----------------------------------------------------
    async def list_public(self, params: PageParams, *, q: str | None, tag: str | None) -> Any:
        return await cached(
            CACHE_NS,
            f"list:{params.page}:{params.size}:{q}:{tag}",
            lambda: self._list(params, q=q, tag=tag, published_only=True),
        )

    async def get_public(self, slug: str) -> Any:
        async def load() -> PostRead:
            post = await self.repo.get_by(slug=slug, status=PostStatus.PUBLISHED)
            if not post:
                raise NotFoundError("Artikel tidak ditemukan")
            return PostRead.model_validate(post)

        return await cached(CACHE_NS, f"detail:{slug}", load)

    # --- Admin ---------------------------------------------------------------
    async def list_admin(self, params: PageParams, q: str | None = None) -> Page[PostListItem]:
        return await self._list(params, q=q, published_only=False)

    async def get(self, post_id: uuid.UUID) -> Post:
        post = await self.repo.get(post_id)
        if not post:
            raise NotFoundError("Artikel tidak ditemukan")
        return post

    async def create(self, data: PostCreate, author_id: uuid.UUID) -> Post:
        slug = slugify(data.slug or data.title)
        await self._ensure_unique_slug(slug)
        payload = data.model_dump(exclude={"slug"})
        post = await self.repo.create(
            **payload,
            slug=slug,
            author_id=author_id,
            reading_minutes=_reading_minutes(data.content),
            published_at=datetime.now(UTC) if data.status == PostStatus.PUBLISHED else None,
        )
        await invalidate(CACHE_NS, "dashboard")
        return post

    async def update(self, post_id: uuid.UUID, data: PostUpdate) -> Post:
        post = await self.get(post_id)
        payload = data.model_dump(exclude_unset=True)
        if payload.get("slug"):
            payload["slug"] = slugify(payload["slug"])
            if payload["slug"] != post.slug:
                await self._ensure_unique_slug(payload["slug"])
        if "content" in payload:
            payload["reading_minutes"] = _reading_minutes(payload["content"] or "")
        if payload.get("status") == PostStatus.PUBLISHED and post.published_at is None:
            payload["published_at"] = datetime.now(UTC)
        post = await self.repo.update(post, **payload)
        await invalidate(CACHE_NS, "dashboard")
        return post

    async def delete(self, post_id: uuid.UUID) -> None:
        await self.repo.delete(await self.get(post_id))
        await invalidate(CACHE_NS, "dashboard")

    # --- Internals -----------------------------------------------------------
    async def _list(
        self,
        params: PageParams,
        *,
        q: str | None = None,
        tag: str | None = None,
        published_only: bool,
    ) -> Page[PostListItem]:
        where: list[ColumnElement[bool]] = []
        if published_only:
            where.append(Post.status == PostStatus.PUBLISHED)
        if q:
            like = f"%{q}%"
            where.append(or_(Post.title.ilike(like), Post.excerpt.ilike(like)))
        if tag:
            where.append(Post.tags.any(tag))
        order = (
            [Post.published_at.desc().nulls_last()] if published_only else [Post.created_at.desc()]
        )
        rows, total = await self.repo.paginate(
            offset=params.offset, limit=params.size, where=where, order_by=order
        )
        return Page.create([PostListItem.model_validate(r) for r in rows], total, params)

    async def _ensure_unique_slug(self, slug: str) -> None:
        if await self.repo.get_by(slug=slug):
            raise ConflictError("Slug sudah digunakan", details={"field": "slug"})
