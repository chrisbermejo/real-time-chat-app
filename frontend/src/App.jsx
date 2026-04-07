import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { useSocket } from "./context/SocketContext";

function App() {
    const { isConnected } = useSocket();
    const [username, setUsername] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeChat, setActiveChat] = useState(null);

    if (!isLoggedIn) {
        return (
            <div style={styles.loginContainer}>
                <h1>Enter your username</h1>
                <input
                    style={styles.input}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Alex"
                />
                <button style={styles.button} onClick={() => setIsLoggedIn(true)}>Join App</button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
            <Sidebar activeChat={activeChat} setActiveChat={setActiveChat} />
            <ChatWindow activeChat={activeChat} username={username} />
        </div>
    );
}

const styles = {
    loginContainer: { textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' },
    input: { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' },
    button: { padding: '10px 20px', marginLeft: '10px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }
};

export default App;