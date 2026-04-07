import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const ChatWindow = ({ activeChat, username }) => {
    const { socket } = useSocket();
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        if (!socket || !activeChat) return;

        socket.emit("join_room", { username, room: activeChat.id });

        socket.on("new_message", (data) => {
            setChatHistory((prev) => [...prev, data]);
        });

        return () => {
            socket.off("new_message");
        };
    }, [activeChat, socket, username]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            socket.emit("send_message", {
                room: activeChat.id,
                username: username,
                text: message
            });
            setMessage("");
        }
    };

    if (!activeChat) return <div style={{ flex: 1, textAlign: 'center', paddingTop: '100px' }}>Select a chat to start</div>;

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{activeChat.name}</h2>
                <button style={{ padding: '8px 15px', borderRadius: '5px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    📹 Video Call
                </button>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#fff' }}>
                {chatHistory.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '15px', textAlign: msg.username === username ? 'right' : 'left' }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>{msg.username}</div>
                        <div style={{
                            display: 'inline-block',
                            padding: '10px',
                            borderRadius: '10px',
                            background: msg.username === username ? '#007bff' : '#eee',
                            color: msg.username === username ? '#fff' : '#000'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} style={{ padding: '20px', borderTop: '1px solid #ddd', display: 'flex' }}>
                <input
                    style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit" style={{ marginLeft: '10px', padding: '10px 20px' }}>Send</button>
            </form>
        </div>
    );
};

export default ChatWindow;