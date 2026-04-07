from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

room_members = Table(
    "room_members",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("room_id", Integer, ForeignKey("rooms.id"))
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    
    friends = relationship(
        "User",
        secondary="friendships",
        primaryjoin="User.id==friendships.c.user_id",
        secondaryjoin="User.id==friendships.c.friend_id"
    )
    rooms = relationship("Room", secondary=room_members, back_populates="members")

class Friendship(Base):
    __tablename__ = "friendships"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    friend_id = Column(Integer, ForeignKey("users.id"), primary_key=True)

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    is_group = Column(Boolean, default=False)
    invite_code = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    members = relationship("User", secondary=room_members, back_populates="rooms")
    messages = relationship("Message", back_populates="room")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    timestamp = Column(DateTime, server_default=func.now())
    
    room = relationship("Room", back_populates="messages")