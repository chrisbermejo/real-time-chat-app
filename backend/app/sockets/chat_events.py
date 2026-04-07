from .connection import sio

@sio.on("join_room")
async def handle_join_room(sid, data):
    room = data.get("room")
    username = data.get("username")
    
    await sio.enter_room(sid, room)
    print(f"User {username} ({sid}) joined room: {room}")
    
    await sio.emit("user_joined", {"username": username}, room=room, skip_sid=sid)

@sio.on("send_message")
async def handle_send_message(sid, data):
    room = data.get("room")
    await sio.emit("new_message", data, room=room)