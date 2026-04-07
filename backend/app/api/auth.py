from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import User
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str

@router.post("/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    
    if not user:
        user = User(username=data.username)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return {"id": user.id, "username": user.username}