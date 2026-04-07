from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import User
from app.services.chat_service import ChatService
from app.sockets.connection import sio

router = APIRouter()

@router.get("/search")
async def search_users(q: str, current_user_id: int, db: Session = Depends(get_db)):
    users = db.query(User).filter(
        User.username.ilike(f"{q}%"),
        User.id != current_user_id
    ).limit(10).all()
    
    return [{"id": u.id, "username": u.username} for u in users]

@router.post("/add-friend")
async def add_friend(user_id: int, friend_id: int, db: Session = Depends(get_db)):
    room = ChatService.create_1v1_chat(db, user_id, friend_id)
    room_name = f"room_{room.id}"

    for uid in [user_id, friend_id]:
        user_room = f"user_{uid}"
        participants = sio.manager.rooms.get('/', {}).get(user_room, [])
        for sid in participants:
            await sio.enter_room(sid, room_name)

    await sio.emit("refresh_chats", {}, room=f"user_{friend_id}")
    return {"status": "success", "room_id": room.id}