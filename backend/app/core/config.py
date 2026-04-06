import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "RTC App"
    CORS_ALLOWED_ORIGINS: list = ["http://localhost:5173", "http://127.0.0.1:5173"]

settings = Settings()