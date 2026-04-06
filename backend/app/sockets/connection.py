import socketio
from app.core.config import settings

# create a Socket.IO server that supports FastAPI
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.CORS_ALLOWED_ORIGINS
)

@sio.event
async def connect(sid, environ):
    print(f"User Connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"User Disconnected: {sid}")