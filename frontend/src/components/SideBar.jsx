import React, { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext'; // <--- NEW: Import socket context

const Sidebar = ({ user_id, activeChat, setActiveChat }) => {
    const { socket } = useSocket(); // <--- NEW: Access the socket instance
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
        fetchMyChats();
    }, [fetchMyChats]);

    useEffect(() => {
        if (!socket || !user_id) return;

        socket.emit("identify", { user_id });

        socket.on("refresh_chats", () => {
            console.log("Socket signal received: Refreshing chat list...");
            fetchMyChats();
        });

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
        <div style={styles.sidebar}>
            <div style={styles.searchSection}>
                <input
                    style={styles.searchInput}
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div style={styles.resultsDropdown}>
                        {searchResults.map(u => (
                            <div key={u.id} style={styles.resultItem} onClick={() => addFriend(u.id)}>
                                ➕ {u.username}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <h4 style={{ color: '#888', marginBottom: '10px' }}>Your Conversations</h4>
            <ul style={styles.list}>
                {rooms.length === 0 && <li style={{ color: '#555', fontSize: '13px' }}>No chats yet. Search for a friend!</li>}
                {rooms.map((room) => (
                    <li
                        key={room.id}
                        onClick={() => setActiveChat(room)}
                        style={{
                            ...styles.item,
                            backgroundColor: activeChat?.id === room.id ? '#333' : 'transparent',
                            borderLeft: activeChat?.id === room.id ? '4px solid #007bff' : '4px solid transparent'
                        }}
                    >
                        {room.is_group ? `👥 ${room.name}` : `👤 Private Chat`}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const styles = {
    sidebar: { width: '300px', background: '#1a1a1a', color: '#fff', height: '100vh', padding: '15px', position: 'relative', borderRight: '1px solid #333' },
    searchSection: { marginBottom: '20px' },
    searchInput: { width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' },
    resultsDropdown: { position: 'absolute', top: '55px', left: '15px', right: '15px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' },
    resultItem: { padding: '12px', cursor: 'pointer', borderBottom: '1px solid #333', fontSize: '14px' },
    list: { listStyle: 'none', padding: 0, margin: 0 },
    item: { padding: '12px', cursor: 'pointer', borderRadius: '4px', marginBottom: '4px', transition: 'background 0.2s' },
};

export default Sidebar;