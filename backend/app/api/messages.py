from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import Message
from app.services.chat_service import ChatService

router = APIRouter()

@router.get("/my-chats/{user_id}")
async def get_my_chats(user_id: int, db: Session = Depends(get_db)):
    rooms = ChatService.get_user_rooms(db, user_id)
    
    chat_list = []
    for r in rooms:
        display_name = r.name
        
        if not r.is_group:
            other_user = next((m for m in r.members if m.id != user_id), None)
            if other_user:
                display_name = other_user.username
            else:
                display_name = "Saved Messages (You)"
        
        chat_list.append({
            "id": r.id, 
            "name": display_name,
            "is_group": r.is_group,
            "invite_code": r.invite_code
        })
        
    return chat_list

@router.get("/history/{room_id}")
async def get_chat_history(room_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(Message.room_id == room_id).order_by(Message.timestamp.asc()).limit(50).all()
    
    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "content": m.content,
            "timestamp": str(m.timestamp)
        } for m in messages
    ]