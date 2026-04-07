import socketio
from app.core.config import settings

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

@sio.on("identify")
async def handle_identify(sid, data):
    user_id = data.get("user_id")
    if user_id:
        await sio.enter_room(sid, f"user_{user_id}")
        print(f"User {user_id} joined private room: user_{user_id}")