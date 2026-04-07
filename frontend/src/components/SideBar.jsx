import React, { useEffect, useState } from 'react';

const Sidebar = ({ user_id, activeChat, setActiveChat }) => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        if (user_id && typeof user_id === 'number') {
            fetch(`http://localhost:8000/api/my-chats/${user_id}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch");
                    return res.json();
                })
                .then(data => {
                    setRooms(Array.isArray(data) ? data : []);
                })
                .catch(err => {
                    console.error("Fetch error:", err);
                    setRooms([]);
                });
        }
    }, [user_id]);

    return (
        <div style={styles.sidebar}>
            <h3>Conversations</h3>
            <ul style={styles.list}>
                {/* FIX 3: Add a "safe navigation" check before mapping */}
                {Array.isArray(rooms) && rooms.map((room) => (
                    <li key={room.id} onClick={() => setActiveChat(room)} style={styles.item}>
                        {room.is_group ? `👥 ${room.name}` : `👤 Private Chat`}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const styles = {
    sidebar: { width: '300px', background: '#222', color: '#fff', height: '100vh', padding: '15px' },
    joinBox: { marginBottom: '20px', display: 'flex', gap: '5px' },
    list: { listStyle: 'none', padding: 0 },
    item: { padding: '10px', cursor: 'pointer', borderRadius: '5px', marginBottom: '5px' },
    code: { fontSize: '10px', color: '#aaa' }
};

export default Sidebar;