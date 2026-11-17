from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession
from app.core.rate_limit import RateLimiter
from app.modules.auth.schemas import LoginRequest, RefreshRequest, RegisterRequest, TokenPair
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/login",
    response_model=TokenPair,
    dependencies=[Depends(RateLimiter("login", times=10, seconds=60))],
)
async def login(data: LoginRequest, db: DbSession) -> TokenPair:
    return await AuthService(db).login(data.email, data.password)


@router.post(
    "/register",
    response_model=TokenPair,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(RateLimiter("register", times=5, seconds=600))],
)
async def register(data: RegisterRequest, db: DbSession) -> TokenPair:
    return await AuthService(db).register(data)


@router.post(
    "/refresh",
    response_model=TokenPair,
    dependencies=[Depends(RateLimiter("refresh", times=30, seconds=60))],
)
async def refresh(data: RefreshRequest, db: DbSession) -> TokenPair:
    return await AuthService(db).refresh(data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(data: RefreshRequest, db: DbSession) -> None:
    await AuthService(db).logout(data.refresh_token)
