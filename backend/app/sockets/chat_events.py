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
    finally:
        db.close()

@sio.on("video_offer")
async def handle_video_offer(sid, data):
    await sio.emit("video_offer", {
        "offering_sid": sid,
        "offer": data["offer"],
        "caller_name": data.get("caller_name")
    }, room=f"room_{data['to_room']}", skip_sid=sid)

@sio.on("video_answer")
async def handle_video_answer(sid, data):
    await sio.emit("video_answer", { "answer": data["answer"] }, room=data["to_sid"])

@sio.on("new_ice_candidate")
async def handle_new_ice_candidate(sid, data):
    target = data.get("to_sid")
    payload = { "candidate": data["candidate"], "from_sid": sid }
    if target:
        await sio.emit("new_ice_candidate", payload, room=target)
    else:
        await sio.emit("new_ice_candidate", payload, room=f"room_{data.get('to_room')}", skip_sid=sid)

@sio.on("end_call")
async def handle_end_call(sid, data):
    target = data.get("to_sid") or f"room_{data.get('to_room')}"
    await sio.emit("call_ended", {}, room=target, skip_sid=sid)