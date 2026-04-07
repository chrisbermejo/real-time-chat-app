# backend/app/core/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "fallback_secret"
    ALGORITHM: str = "HS256"

    CORS_ALLOWED_ORIGINS: list = ["http://localhost:5173"]

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()