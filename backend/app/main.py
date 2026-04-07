from fastapi import FastAPI
import socketio
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
from app.models import schemas
from app.api import auth, messages, users
from app.sockets.connection import sio

schemas.Base.metadata.create_all(bind=engine)

fastapi_app = FastAPI(title=settings.PROJECT_NAME)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app.include_router(auth.router, prefix="/api/auth")
fastapi_app.include_router(messages.router, prefix="/api")
fastapi_app.include_router(users.router, prefix="/api/users")

import app.sockets.chat_events 

socket_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)

@fastapi_app.get("/")
async def root():
    return {"status": "online", "database": "connected"}