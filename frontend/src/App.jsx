import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

function App() {
    const [user, setUser] = useState(null);
    const [usernameInput, setUsernameInput] = useState("");
    const [activeChat, setActiveChat] = useState(null);

    const handleLogin = async () => {
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
        }
    };

    if (user && user.id) {
        return (
            <div style={{ display: 'flex', height: '100vh' }}>
                <Sidebar user_id={user.id} activeChat={activeChat} setActiveChat={setActiveChat} />
                <ChatWindow activeChat={activeChat} username={user.username} />
            </div>
        );
    }

    return (
        <div style={styles.loginContainer}>
            <h1>Enter your username</h1>
            <input
                style={styles.input}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Alex"
            />
            <button style={styles.button} onClick={handleLogin}>Join App</button>
        </div>
    );
}

const styles = {
    loginContainer: { textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' },
    input: { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' },
    button: { padding: '10px 20px', marginLeft: '10px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }
};

export default App;