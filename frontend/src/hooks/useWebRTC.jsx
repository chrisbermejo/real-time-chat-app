import { useState, useRef, useCallback } from 'react';

export const useWebRTC = () => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const pc = useRef(null);
    const localStreamRef = useRef(null);

    const pcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    const cleanup = useCallback(() => {
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
    }, []);

    const initPeerConnection = useCallback((stream) => {
        const peer = new RTCPeerConnection(pcConfig);

        stream.getTracks().forEach(track => {
            peer.addTrack(track, stream);
        });

        peer.ontrack = (event) => {
            console.log("WebRTC: Received remote track");
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        pc.current = peer;
        return peer;
    }, []);

    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setLocalStream(stream);
            localStreamRef.current = stream;
            return stream;
        } catch (e) {
            console.error("WebRTC: Camera access denied", e);
            return null;
        }
    };

    return { pc, localStream, remoteStream, startLocalStream, initPeerConnection, cleanup };
};