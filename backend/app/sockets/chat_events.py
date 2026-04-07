from .connection import sio
from app.core.database import SessionLocal
from app.models.schemas import Message

@sio.on("send_message")
async def handle_send_message(sid, data):
    room_id = data.get("room_id")
    sender_id = data.get("sender_id")
    content = data.get("content")

    db = SessionLocal()
    try:
        new_msg = Message(room_id=room_id, sender_id=sender_id, content=content)
        db.add(new_msg)
        db.commit()
        db.refresh(new_msg)

        payload = {
            "id": new_msg.id,
            "room_id": room_id,
            "sender_id": sender_id,
            "content": content,
            "timestamp": str(new_msg.timestamp)
        }
        await sio.emit("new_message", payload, room=f"room_{room_id}")
        print(f"Message sent to room_{room_id}")
    finally:
        db.close()