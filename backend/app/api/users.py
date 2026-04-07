from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import User, Room
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
    await sio.emit("refresh_chats", {}, room=f"user_{friend_id}")
    
    return {"status": "success", "room_id": room.id}