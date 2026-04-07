import uuid
from sqlalchemy.orm import Session
from app.models.schemas import Room, User

class ChatService:
    @staticmethod
    def get_user_rooms(db: Session, user_id: int):
        user = db.query(User).filter(User.id == user_id).first()
        return user.rooms if user else []

    @staticmethod
    def create_1v1_chat(db: Session, user1_id: int, user2_id: int):
        new_room = Room(is_group=False)
        u1 = db.query(User).get(user1_id)
        u2 = db.query(User).get(user2_id)
        new_room.members.extend([u1, u2])
        db.add(new_room)
        db.commit()
        return new_room

    @staticmethod
    def create_group(db: Session, name: str, creator_id: int):
        invite_code = str(uuid.uuid4())[:8].upper()
        new_room = Room(name=name, is_group=True, invite_code=invite_code)
        creator = db.query(User).get(creator_id)
        new_room.members.append(creator)
        db.add(new_room)
        db.commit()
        return new_room

    @staticmethod
    def join_group_by_code(db: Session, user_id: int, code: str):
        room = db.query(Room).filter(Room.invite_code == code).first()
        if room:
            user = db.query(User).get(user_id)
            if user not in room.members:
                room.members.append(user)
                db.commit()
            return room
        return None