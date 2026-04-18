import React, { useState, useEffect } from "react";
import Sidebar from "./components/SideBar";
import ChatWindow from "./components/ChatWindow";
import { useSocket } from "./context/SocketContext";
import "./App.css";

function App() {
    const { socket } = useSocket();
    const [user, setUser] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "", email: "", username: "", password: ""
    });
    const [error, setError] = useState("");
    const [activeChat, setActiveChat] = useState(null);
    const [allMessages, setAllMessages] = useState({});

    useEffect(() => {
        const savedUser = localStorage.getItem("chatsense_user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem("chatsense_user");
            }
        }
        setIsInitialLoading(false);
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = (msg) => {
            setAllMessages((prev) => {
                const roomId = msg.room_id;
                const existingMsgs = prev[roomId] || [];
                return { ...prev, [roomId]: [...existingMsgs, msg] };
            });
        };
        socket.on("new_message", handleNewMessage);
        return () => socket.off("new_message", handleNewMessage);
    }, [socket]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");
        const endpoint = isSignup ? "signup" : "login";

        try {
            const response = await fetch(`http://localhost:8000/api/auth/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                setUser(data);
                localStorage.setItem("chatsense_user", JSON.stringify(data));
            } else {
                setError(data.detail || "Authentication failed");
            }
        } catch (err) {
            setError("Server connection failed");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("chatsense_user");
        setUser(null);
        setActiveChat(null);
    };

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { text: "", color: "transparent" };
        if (pwd.length < 8) return { text: "Too Short", color: "#ff4444" };
        const hasNumbers = /\d/.test(pwd);
        const hasUpper = /[A-Z]/.test(pwd);
        const hasSpecial = /[!@#$%^&*]/.test(pwd);
        if (hasNumbers && hasUpper && hasSpecial) return { text: "Strong", color: "#4cd137" };
        return { text: "Medium", color: "#fbc531" };
    };

    if (isInitialLoading) {
        return <div className="login-screen"></div>;
    }

    if (!user) {
        const strength = getPasswordStrength(formData.password);
        return (
            <div className="login-screen">
                <div className="login-card">
                    <h1 className="login-card-heading">Chatsense</h1>
                    <p className="login-card-paragraph">{isSignup ? "Create an account" : "Welcome back!"}</p>
                    <form onSubmit={handleAuth} className="login-card-form">
                        {error && <div className="form-error">{error}</div>}
                        {isSignup && (
                            <>
                                <input placeholder="Full Name" onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />
                                <input type="email" placeholder="Email" onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            </>
                        )}
                        <input placeholder="Username" onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                        <input type="password" placeholder="Password" onChange={e => setFormData({ ...formData, password: e.target.value })} required />

                        {isSignup && formData.password && (
                            <div style={{ color: strength.color }} className="password-strength">
                                Strength: {strength.text} (Min 8 chars, 1 Uppercase, 1 Number, 1 Special)
                            </div>
                        )}
                        <button type="submit" className="login-btn">{isSignup ? "Sign Up" : "Login"}</button>
                    </form>
                    <button onClick={() => setIsSignup(!isSignup)} className="toggle-auth-btn">
                        {isSignup ? <>Already have an account? <span>Login</span></> : <>Need an account? <span>Sign Up</span></>}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Sidebar user={user} activeChat={activeChat} setActiveChat={setActiveChat} onLogout={handleLogout} />
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