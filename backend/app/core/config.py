"""Application settings, loaded from environment variables (12-factor)."""

from functools import lru_cache
from typing import Annotated, Literal

from pydantic import AnyHttpUrl, BeforeValidator, PostgresDsn, RedisDsn, computed_field
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


def _split_csv(value: str | list[str]) -> list[str]:
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return value


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_ignore_empty=True,
        extra="ignore",
    )

    # --- App -----------------------------------------------------------------
    PROJECT_NAME: str = "Yasun Studio API"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    API_V1_PREFIX: str = "/api/v1"
    LOG_LEVEL: str = "INFO"
    FRONTEND_URL: AnyHttpUrl = AnyHttpUrl("http://localhost:3000")
    CORS_ORIGINS: Annotated[list[str], NoDecode, BeforeValidator(_split_csv)] = []

    # --- Security ------------------------------------------------------------
    SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Database ------------------------------------------------------------
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "yasun"
    POSTGRES_PASSWORD: str = "yasun"
    POSTGRES_DB: str = "yasun_studio"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_ECHO: bool = False

    # --- Redis ---------------------------------------------------------------
    REDIS_URL: RedisDsn = RedisDsn("redis://redis:6379/0")
    CACHE_TTL_SECONDS: int = 300

    # --- Bootstrap -----------------------------------------------------------
    FIRST_SUPERUSER_EMAIL: str = "admin@yasunstudio.com"
    FIRST_SUPERUSER_PASSWORD: str = "ChangeMe123!"
    SEED_SAMPLE_DATA: bool = True

    @computed_field  # type: ignore[prop-decorator]
    @property
    def DATABASE_URL(self) -> str:
        return str(
            PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=self.POSTGRES_USER,
                password=self.POSTGRES_PASSWORD,
                host=self.POSTGRES_HOST,
                port=self.POSTGRES_PORT,
                path=self.POSTGRES_DB,
            )
        )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def ALL_CORS_ORIGINS(self) -> list[str]:
        origins = {str(self.FRONTEND_URL).rstrip("/"), *self.CORS_ORIGINS}
        return sorted(o.rstrip("/") for o in origins)

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
