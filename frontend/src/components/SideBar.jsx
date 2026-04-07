import React from 'react';

const Sidebar = ({ activeChat, setActiveChat }) => {
    const chats = [
        { id: "room_1", name: "Project Alpha (Group)", type: "group" },
        { id: "user_jake", name: "Jake (1-on-1)", type: "private" },
        { id: "room_2", name: "Gaming Room", type: "group" },
    ];

    return (
        <div style={{ width: '300px', borderRight: '1px solid #ddd', height: '100vh', background: '#f9f9f9' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
                <h3>Conversations</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {chats.map((chat) => (
                    <li
                        key={chat.id}
                        onClick={() => setActiveChat(chat)}
                        style={{
                            padding: '15px 20px',
                            cursor: 'pointer',
                            background: activeChat?.id === chat.id ? '#e0f0ff' : 'transparent',
                            borderBottom: '1px solid #eee'
                        }}
                    >
                        <strong>{chat.name}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>{chat.type}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;