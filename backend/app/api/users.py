from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import Room, User
from app.services.chat_service import ChatService
from app.sockets.connection import sio
import uuid

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

@router.post("/create-group")
async def create_group(user_id: int = Body(...), group_name: str = Body(...), db: Session = Depends(get_db)):
    invite_code = str(uuid.uuid4())[:8].upper()
    print(invite_code)
    new_room = Room(name=group_name, is_group=True, invite_code=invite_code)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    user = db.query(User).get(user_id)
    new_room.members.append(user)
    db.commit()
    
    user_room = f"user_{user_id}"
    participants = sio.manager.rooms.get('/', {}).get(user_room, [])
    for sid in participants:
        await sio.enter_room(sid, f"room_{new_room.id}")
        
    return {
        "id": new_room.id,
        "name": new_room.name,
        "invite_code": invite_code
    }

@router.post("/join-group")
async def join_group(user_id: int = Body(...), invite_code: str = Body(...), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.invite_code == invite_code, Room.is_group == True).first()
    
    if not room:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    user = db.query(User).get(user_id)
    if user not in room.members:
        room.members.append(user)
        db.commit()

    user_room = f"user_{user_id}"
    participants = sio.manager.rooms.get('/', {}).get(user_room, [])
    for sid in participants:
        await sio.enter_room(sid, f"room_{room.id}")

    return {"status": "success", "room_id": room.id, "name": room.name}