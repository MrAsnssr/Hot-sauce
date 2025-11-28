import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (gameId?: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const socketUrl = (import.meta.env && import.meta.env.VITE_SOCKET_URL) || 'http://localhost:5000';
    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      socket.emit('join-game', gameId);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-game', gameId);
        socketRef.current.disconnect();
      }
    };
  }, [gameId]);

  return socketRef.current;
};

