import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { useSocket } from "./context/SocketContext";
import "./App.css";

function App() {
    const { socket } = useSocket();
    const [user, setUser] = useState(null);
    const [usernameInput, setUsernameInput] = useState("");
    const [activeChat, setActiveChat] = useState(null);
    const [allMessages, setAllMessages] = useState({});

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            console.log("Global Socket - Message Received:", msg);

            setAllMessages((prev) => {
                const roomId = msg.room_id;
                const existingMsgs = prev[roomId] || [];

                return {
                    ...prev,
                    [roomId]: [...existingMsgs, msg],
                };
            });
        };

        socket.on("new_message", handleNewMessage);

        return () => {
            socket.off("new_message", handleNewMessage);
        };
    }, [socket]);

    const handleLogin = async () => {
        if (!usernameInput.trim()) return;

        try {
            const response = await fetch("http://localhost:8000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: usernameInput }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.id) {
                    setUser(data);
                }
            } else {
                console.error("Login failed server-side");
            }
        } catch (error) {
            console.error("Error connecting to Auth API:", error);
        }
    };

    if (!user || !user.id) {
        return (
            <div className="login-screen">
                <div className="login-card">
                    <h1>CHATSENSE</h1>
                    <p style={{ marginBottom: "20px", color: "var(--text)" }}>
                        Real-time communication application
                    </p>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <input
                            type="text"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            placeholder="What's your username?"
                            autoFocus
                        />
                        <button onClick={handleLogin}>Join App</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Sidebar
                user_id={user.id}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
            />

            <ChatWindow
                activeChat={activeChat}
                user={user}
                allMessages={allMessages}
                setAllMessages={setAllMessages}
            />
        </div>
    );
}

export default App;