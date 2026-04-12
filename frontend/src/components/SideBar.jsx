import React, { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

const Sidebar = ({ user_id, activeChat, setActiveChat }) => {
    const { socket } = useSocket();
    const [rooms, setRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const fetchMyChats = useCallback(() => {
        if (user_id && typeof user_id === 'number') {
            fetch(`http://localhost:8000/api/my-chats/${user_id}`)
                .then(res => res.json())
                .then(data => {
                    setRooms(Array.isArray(data) ? data : []);
                })
                .catch(err => console.error("Error fetching chats:", err));
        }
    }, [user_id]);

    useEffect(() => {
        if (!socket || !user_id) return;

        socket.emit("identify", { user_id });

        socket.on("refresh_chats", () => {
            fetchMyChats();
        });

        fetchMyChats();

        return () => {
            socket.off("refresh_chats");
        };
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
        try {
            await fetch(`http://localhost:8000/api/users/add-friend?user_id=${user_id}&friend_id=${friendId}`, {
                method: 'POST'
            });
            setSearchQuery("");
            fetchMyChats();
        } catch (error) {
            console.error("Failed to add friend", error);
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-search-section">
                <input
                    className="sidebar-search-input"
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchResults.length > 0 && (
                    <div className="sidebar-results-dropdown">
                        {searchResults.map(u => (
                            <div key={u.id} className="sidebar-result-item" onClick={() => addFriend(u.id)}>
                                ➕ {u.username}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <h4 style={{ color: '#888', marginBottom: '10px', fontSize: '12px', textTransform: 'uppercase' }}>Conversations</h4>

            <ul className="sidebar-list">
                {rooms.length === 0 && <li style={{ color: '#555', fontSize: '13px', padding: '10px' }}>No chats yet.</li>}

                {rooms.map((room) => (
                    <li
                        key={room.id}
                        onClick={() => setActiveChat(room)}
                        className={`sidebar-item ${activeChat?.id === room.id ? 'active' : ''}`}
                    >
                        <span>{room.is_group ? "👥" : "👤"}</span>
                        {room.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;