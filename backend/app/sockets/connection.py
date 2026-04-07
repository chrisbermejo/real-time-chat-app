import socketio
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.schemas import User

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
    if not user_id: return

    db = SessionLocal()
    try:
        await sio.enter_room(sid, f"user_{user_id}")

        user = db.query(User).get(user_id)
        if user:
            for room in user.rooms:
                await sio.enter_room(sid, f"room_{room.id}")
                print(f"User {user_id} background-joined room_{room.id}")
    finally:
        db.close()