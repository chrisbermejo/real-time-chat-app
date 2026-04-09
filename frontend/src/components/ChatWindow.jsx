import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const ChatWindow = ({ activeChat, user, allMessages, setAllMessages }) => {
    const { socket } = useSocket();
    const [inputText, setInputText] = useState("");
    const scrollRef = useRef();

    const currentMessages = (activeChat && allMessages[activeChat.id]) || [];

    useEffect(() => {
        if (activeChat && activeChat.id) {
            if (!allMessages[activeChat.id]) {
                console.log("Cache empty. Fetching from API...");
                fetch(`http://localhost:8000/api/history/${activeChat.id}`)
                    .then(res => res.json())
                    .then(data => {
                        setAllMessages(prev => ({
                            ...prev,
                            [activeChat.id]: Array.isArray(data) ? data : []
                        }));
                    });
            } else {
                console.log("Loading from cache...");
            }
        }
    }, [activeChat, allMessages, setAllMessages]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentMessages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !socket || !activeChat) return;

        socket.emit("send_message", {
            room_id: activeChat.id,
            sender_id: user.id,
            content: inputText
        });
        setInputText("");
    };

    if (!activeChat) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121212', color: '#555' }}><h2>Select a chat</h2></div>;

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#121212', color: '#fff' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
                <h2>{activeChat.name}</h2>
                <button style={{ background: '#28a745', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px' }}>📹 Video Call</button>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentMessages.map((m, i) => (
                    <div key={i} style={{
                        padding: '10px 16px',
                        borderRadius: '15px',
                        maxWidth: '65%',
                        alignSelf: m.sender_id == user.id ? 'flex-end' : 'flex-start',
                        background: m.sender_id == user.id ? '#007bff' : '#333',
                    }}>
                        {m.content}
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={sendMessage} style={{ padding: '20px', display: 'flex', gap: '12px', background: '#1a1a1a' }}>
                <input
                    style={{ flex: 1, padding: '14px', borderRadius: '10px', background: '#2a2a2a', color: '#fff', border: 'none' }}
                    value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..."
                />
                <button type="submit" style={{ padding: '0 25px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '10px' }}>Send</button>
            </form>
        </div>
    );
};

export default ChatWindow;