import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Get socket URL based on environment
const getSocketUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env?.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  
  // In development (localhost), use local server
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // In production on Render
  return 'https://hot-sauce.onrender.com';
};

export const useSocket = (gameId?: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const socketUrl = getSocketUrl();
    console.log('🔌 Socket connecting to:', socketUrl);
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'], // Allow fallback to polling
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
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

