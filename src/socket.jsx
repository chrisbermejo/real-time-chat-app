import { io } from 'socket.io-client';

let socket = null;

export const createSocket = () => {
    if (!socket) {
        socket = io('https://chrisbermejo-chatroom.up.railway.app/channel', {
            withCredentials: true,
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
