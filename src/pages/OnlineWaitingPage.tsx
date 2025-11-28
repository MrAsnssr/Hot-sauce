import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WoodyBackground } from '../components/Shared/WoodyBackground';
import { io, Socket } from 'socket.io-client';

const OnlineWaitingPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [playerName] = useState(() => sessionStorage.getItem('playerName') || 'لاعب');
  const [roomCode] = useState(() => sessionStorage.getItem('roomCode') || '');
  const [dots, setDots] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);

    // Connect to socket
    const socketUrl = import.meta.env?.VITE_SOCKET_URL || 
                     (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://hot-sauce.onrender.com');
    
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'], // Allow fallback to polling
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
    });

    let hasJoined = false;

    socket.on('connect', () => {
      console.log('🔌 Player connected to socket in waiting page');
      setConnected(true);
      setError('');
      
      // Only join once
      if (!hasJoined) {
        hasJoined = true;
        const code = roomCode.toUpperCase();
        console.log(`🔌 Joining game room: ${code} as player: ${playerName}`);
        socket.emit('join-game', {
          gameId: code,
          playerName: playerName,
          isHost: false,
        });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
      setConnected(false);
      setError('فشل الاتصال بالخادم. يرجى التأكد من أن المضيف متصل.');
    });

    socket.on('game-started', (data?: { players?: any[] }) => {
      console.log('🎮 Game started event received, navigating to game page', data);
      clearInterval(dotsInterval);
      
      // Save game data if provided
      if (data?.players) {
        const gameData = {
          roomCode,
          isHost: false,
          players: data.players,
        };
        sessionStorage.setItem('onlineGame', JSON.stringify(gameData));
      }
      
      socket.disconnect();
      // Navigate to the game page
      navigate(`/online/game/${roomCode}`);
    });

    socket.on('game-config-updated', () => {
      // Game config updated, but still waiting for start
      console.log('📋 Game config updated');
    });

    socket.on('game-action', (data: { action: string }) => {
      if (data.action === 'start') {
        console.log('🎮 Game start action received');
        clearInterval(dotsInterval);
        socket.disconnect();
        navigate(`/online/game/${roomCode}`);
      }
    });

    // Also listen for config updates that might indicate game is starting
    socket.on('game-config-updated', (config: any) => {
      console.log('📋 Game config updated in waiting page', config);
      // If players are provided, game might be starting
      if (config.players && config.players.length > 0) {
        // Save config but don't navigate yet - wait for explicit game-started
        const gameData = {
          roomCode,
          isHost: false,
          players: config.players || [],
        };
        sessionStorage.setItem('onlineGame', JSON.stringify(gameData));
      }
    });

    return () => {
      clearInterval(dotsInterval);
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [roomCode, navigate, playerName]);

  const leaveRoom = () => {
    sessionStorage.removeItem('playerName');
    sessionStorage.removeItem('roomCode');
    sessionStorage.removeItem('isHost');
    navigate('/');
  };

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          
          {/* Player Info */}
          <div className="bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              مرحباً، {playerName}!
            </h2>
            <p className="text-white/70">
              رمز الغرفة: <span className="text-yellow-400 font-bold text-xl">{roomCode}</span>
            </p>
          </div>

          {/* Waiting Animation */}
          <div className="bg-white/10 rounded-xl p-8 mb-6">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-xl font-bold text-white mb-2">
              في انتظار بدء اللعبة{dots}
            </h3>
            <p className="text-white/60">
              سيبدأ المضيف اللعبة قريباً
            </p>
          </div>

          {/* Connection Status */}
          <div className={`rounded-xl p-4 mb-6 ${connected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <p className={`text-sm ${connected ? 'text-green-300' : 'text-red-300'}`}>
              {connected ? '✅ متصل بالخادم' : '❌ غير متصل'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <p className="text-white/50 text-sm">
              💡 نصيحة: تأكد من أن المضيف يرى اسمك في قائمة اللاعبين
            </p>
          </div>

          {/* Leave Button */}
          <button
            onClick={leaveRoom}
            className="text-white/60 hover:text-white transition-colors"
          >
            ← مغادرة الغرفة
          </button>
        </div>
      </div>
    </WoodyBackground>
  );
};

export default OnlineWaitingPage;
