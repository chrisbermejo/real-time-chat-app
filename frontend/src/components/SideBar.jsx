import React, { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

const Sidebar = ({ user, activeChat, setActiveChat, onLogout, theme, toggleTheme }) => {
    const { socket } = useSocket();
    const [rooms, setRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [isJoiningGroup, setIsJoiningGroup] = useState(false);
    const [inviteCodeInput, setInviteCodeInput] = useState("");

    const user_id = user?.id;

    const fetchMyChats = useCallback(() => {
        if (user_id && typeof user_id === 'number') {
            fetch(`http://localhost:8000/api/my-chats/${user_id}`)
                .then(res => res.json())
                .then(data => setRooms(Array.isArray(data) ? data : []))
                .catch(err => console.error("Error fetching chats:", err));
        }
    }, [user_id]);

    useEffect(() => {
        if (!socket || !user_id) return;
        socket.emit("identify", { user_id });
        socket.on("refresh_chats", () => fetchMyChats());
        fetchMyChats();
        return () => socket.off("refresh_chats");
    }, [socket, user_id, fetchMyChats]);

    useEffect(() => {
        if (searchQuery.length > 1) {
            fetch(`http://localhost:8000/api/users/search?q=${searchQuery}&current_user_id=${user_id}`)
                .then(res => res.json())
                .then(data => setSearchResults(data));
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, user_id]);

    const addFriend = async (friendId) => {
        await fetch(`http://localhost:8000/api/users/add-friend?user_id=${user_id}&friend_id=${friendId}`, { method: 'POST' });
        setSearchQuery("");
        fetchMyChats();
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        const response = await fetch("http://localhost:8000/api/users/create-group", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, group_name: newGroupName })
        });
        if (response.ok) {
            setNewGroupName("");
            setIsCreatingGroup(false);
            fetchMyChats();
        }
    };

    const handleJoinGroup = async () => {
        if (!inviteCodeInput.trim()) return;
        const response = await fetch("http://localhost:8000/api/users/join-group", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, invite_code: inviteCodeInput.toUpperCase() })
        });
        if (response.ok) {
            setInviteCodeInput("");
            setIsJoiningGroup(false);
            fetchMyChats();
        } else {
            alert("Invalid invite code");
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-search-section">
                <input className="sidebar-search-input" placeholder="Search people..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchResults.length > 0 && (
                    <div className="sidebar-results-dropdown">
                        {searchResults.map(u => (
                            <div key={u.id} className="sidebar-result-item" onClick={() => addFriend(u.id)}>➕ {u.username}</div>
                        ))}
                    </div>
                )}
            </div>

            {!isCreatingGroup ? (
                <button onClick={() => { setIsCreatingGroup(true); setIsJoiningGroup(false); }} className="sidebar-create-btn">+ Create Group</button>
            ) : (
                <div className="sidebar-group-form">
                    <input className="sidebar-group-input" placeholder="Group Name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} autoFocus />
                    <div className="sidebar-group-btns">
                        <button onClick={handleCreateGroup} className="video-call-btn" style={{ flex: 1 }}>Create</button>
                        <button onClick={() => setIsCreatingGroup(false)} className="btn-cancel">Cancel</button>
                    </div>
                </div>
            )}

            {!isJoiningGroup ? (
                <button onClick={() => { setIsJoiningGroup(true); setIsCreatingGroup(false); }} className="sidebar-join-btn"># Join with Code</button>
            ) : (
                <div className="sidebar-group-form">
                    <input className="sidebar-join-input" placeholder="Invite Code" value={inviteCodeInput} onChange={(e) => setInviteCodeInput(e.target.value)} autoFocus />
                    <div className="sidebar-group-btns">
                        <button onClick={handleJoinGroup} className="video-call-btn" style={{ flex: 1, background: '#4cd137' }}>Join</button>
                        <button onClick={() => setIsJoiningGroup(false)} className="btn-cancel">Cancel</button>
                    </div>
                </div>
            )}

            <h4 style={{ color: '#888', marginBottom: '10px', fontSize: '11px', textTransform: 'uppercase' }}>Conversations</h4>

            <ul className="sidebar-list" style={{ listStyle: 'none', padding: 0, overflowY: 'auto' }}>
                {rooms.map((room) => (
                    <li key={room.id} onClick={() => setActiveChat(room)} className={`sidebar-item ${activeChat?.id === room.id ? 'active' : ''}`}>
                        <span>{room.is_group ? "👥" : "👤"}</span>
                        <div className="room-name-container">
                            <span style={{ fontWeight: '500' }}>{room.name}</span>
                            {room.is_group && <span className="invite-code">Code: {room.invite_code}</span>}
                        </div>
                    </li>
                ))}
            </ul>

            <div className="sidebar-footer">
                <span className="user-info">@{user.username}</span>
                <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Light/Dark Mode">
                    <span>{theme === "dark" ? "☀️" : "🌙"}</span>
                </button>
                <button onClick={onLogout} className="logout-btn">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;