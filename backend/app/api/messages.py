from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.chat_service import ChatService

router = APIRouter()

@router.get("/my-chats/{user_id}")
async def get_my_chats(user_id: int, db: Session = Depends(get_db)):
    rooms = ChatService.get_user_rooms(db, user_id)
    if not rooms:
        return []
    return [{"id": r.id, "name": r.name, "is_group": r.is_group} for r in rooms]