import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const ChatWindow = ({ activeChat, user }) => {
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const scrollRef = useRef();

    const activeChatRef = useRef(activeChat);

    useEffect(() => {
        activeChatRef.current = activeChat;
        if (activeChat && activeChat.id) {
            setMessages([]);
            fetch(`http://localhost:8000/api/history/${activeChat.id}`)
                .then(res => res.json())
                .then(data => {
                    setMessages(Array.isArray(data) ? data : []);
                })
                .catch(err => console.error("Error loading history:", err));
        }
    }, [activeChat]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            if (activeChatRef.current && msg.room_id == activeChatRef.current.id) {
                setMessages((prev) => [...prev, msg]);
            } else {
                console.log("Background message received for room:", msg.room_id);
            }
        };

        socket.on("new_message", handleNewMessage);

        return () => {
            socket.off("new_message", handleNewMessage);
        };
    }, [socket]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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

    if (!activeChat) {
        return (
            <div style={styles.emptyState}>
                <h2 style={{ color: '#444' }}>Select a conversation to start chatting</h2>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{activeChat.is_group ? "👥" : "👤"}</span>
                    <h2 style={{ margin: 0 }}>{activeChat.name}</h2>
                </div>
                <button style={styles.callBtn}>
                    📹 Video Call
                </button>
            </div>

            <div style={styles.messageList}>
                {messages.map((m) => (
                    <div key={m.id || Math.random()} style={{
                        ...styles.msgBubble,
                        alignSelf: m.sender_id == user.id ? 'flex-end' : 'flex-start',
                        background: m.sender_id == user.id ? '#007bff' : '#333',
                        borderBottomRightRadius: m.sender_id == user.id ? '2px' : '15px',
                        borderBottomLeftRadius: m.sender_id == user.id ? '15px' : '2px',
                    }}>
                        <div style={styles.msgContent}>{m.content}</div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={sendMessage} style={styles.inputArea}>
                <input
                    style={styles.inputField}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activeChat.name}...`}
                />
                <button type="submit" style={styles.sendBtn}>Send</button>
            </form>
        </div>
    );
};

const styles = {
    container: { flex: 1, display: 'flex', flexDirection: 'column', background: '#121212', color: '#fff', height: '100vh' },
    header: { padding: '15px 25px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a' },
    callBtn: { background: '#28a745', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    messageList: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
    msgBubble: { padding: '10px 16px', borderRadius: '15px', maxWidth: '65%', position: 'relative' },
    msgContent: { fontSize: '15px', lineHeight: '1.4' },
    inputArea: { padding: '20px', display: 'flex', gap: '12px', background: '#1a1a1a', borderTop: '1px solid #333' },
    inputField: { flex: 1, padding: '14px', borderRadius: '10px', background: '#2a2a2a', color: '#fff', border: '1px solid #444', outline: 'none' },
    sendBtn: { padding: '0 25px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    emptyState: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121212' }
};

export default ChatWindow;