from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "RTC App"
    
    DATABASE_URL: str
    
    SECRET_KEY: str = "fallback_secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    CORS_ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()