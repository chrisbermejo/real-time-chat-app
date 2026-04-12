import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';

const ChatWindow = ({ activeChat, user, allMessages, setAllMessages }) => {
    const { socket } = useSocket();
    const { pc, localStream, remoteStream, startLocalStream, initPeerConnection, cleanup } = useWebRTC();

    const [inputText, setInputText] = useState("");
    const [isCalling, setIsCalling] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);

    const scrollRef = useRef();
    const activeChatRef = useRef(activeChat);
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const callTimerRef = useRef();

    const currentMessages = (activeChat && allMessages[activeChat.id]) || [];


    useEffect(() => {
        if (isCalling) {
            if (localVideoRef.current && localStream) {
                localVideoRef.current.srcObject = localStream;
            }
            if (remoteVideoRef.current && remoteStream) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
        }
    }, [localStream, remoteStream, isCalling]);

    const stopCallUI = () => {
        cleanup();
        setIsCalling(false);
        setIncomingCall(null);
        if (callTimerRef.current) clearTimeout(callTimerRef.current);
    };

    useEffect(() => {
        if (!socket) return;

        socket.on("video_offer", (data) => {
            console.log("Incoming offer...");
            setIncomingCall(data);
        });

        socket.on("video_answer", async (data) => {
            console.log("Answer received, finishing handshake");
            if (callTimerRef.current) clearTimeout(callTimerRef.current);
            if (pc.current) {
                await pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        });

        socket.on("new_ice_candidate", async (data) => {
            if (pc.current && pc.current.remoteDescription) {
                try {
                    await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) { console.error("ICE Error", e); }
            }
        });

        socket.on("call_ended", () => stopCallUI());

        return () => {
            socket.off("video_offer");
            socket.off("video_answer");
            socket.off("new_ice_candidate");
            socket.off("call_ended");
        };
    }, [socket, pc]);

    const handleStartCall = async () => {
        setIsCalling(true);
        const stream = await startLocalStream();
        if (!stream) return setIsCalling(false);

        const peer = initPeerConnection(stream);

        peer.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("new_ice_candidate", { to_room: activeChat.id, candidate: e.candidate });
            }
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("video_offer", { to_room: activeChat.id, offer, caller_name: user.username });

        callTimerRef.current = setTimeout(() => handleEndCall(), 15000);
    };

    const handleAnswerCall = async () => {
        setIsCalling(true);
        const stream = await startLocalStream();
        if (!stream) return stopCallUI();

        const peer = initPeerConnection(stream);

        peer.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("new_ice_candidate", { to_sid: incomingCall.offering_sid, candidate: e.candidate });
            }
        };

        await peer.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("video_answer", { to_sid: incomingCall.offering_sid, answer });
        setIncomingCall(null);
    };

    const handleEndCall = () => {
        socket.emit("end_call", {
            to_room: activeChat?.id,
            to_sid: incomingCall?.offering_sid
        });
        stopCallUI();
    };

    useEffect(() => {
        activeChatRef.current = activeChat;
        if (activeChat && activeChat.id && !allMessages[activeChat.id]) {
            fetch(`http://localhost:8000/api/history/${activeChat.id}`).then(res => res.json()).then(data => {
                setAllMessages(prev => ({ ...prev, [activeChat.id]: Array.isArray(data) ? data : [] }));
            });
        }
    }, [activeChat]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentMessages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !socket || !activeChat) return;
        socket.emit("send_message", { room_id: activeChat.id, sender_id: user.id, content: inputText });
        setInputText("");
    };

    if (!activeChat) return <div className="chat-empty-state"><h2>Select a chat</h2></div>;

    return (
        <div className="chat-window">
            {isCalling && (
                <div className="video-overlay">
                    {/* Big Video = Remote Stream */}
                    <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />

                    {/* Small Video = Local Stream */}
                    <div className="local-video-pip">
                        <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    </div>

                    <button onClick={handleEndCall} className="end-call-btn">End Call</button>
                </div>
            )}

            <div className="chat-header">
                {incomingCall && !isCalling ? (
                    <>
                        <h2 style={{ color: 'var(--accent)' }}>{incomingCall.caller_name} is calling...</h2>
                        <div>
                            <button onClick={handleAnswerCall} className="video-call-btn" style={{ marginRight: '10px' }}>Accept</button>
                            <button onClick={() => setIncomingCall(null)} style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Decline</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>{activeChat.name}</h2>
                        {!isCalling && <button onClick={handleStartCall} className="video-call-btn">📹 Video Call</button>}
                    </>
                )}
            </div>

            <div className="messages-list">
                {currentMessages.map((m, i) => (
                    <div key={i} className={`message-bubble ${m.sender_id == user.id ? 'message-mine' : 'message-theirs'}`}>
                        {m.content}
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-input-area">
                <input className="chat-input" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..." />
                <button type="submit" className="chat-send-btn">Send</button>
            </form>
        </div>
    );
};

export default ChatWindow;