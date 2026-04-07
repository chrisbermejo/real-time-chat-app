import { useEffect, useState } from "react";
import { socket } from "../context/socket";

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            console.log("Connected to Backend!");
        }

        function onDisconnect() {
            setIsConnected(false);
            console.log("Disconnected from Backend!");
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        socket.connect();

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.disconnect();
        };
    }, []);

    return { isConnected, socket };
};