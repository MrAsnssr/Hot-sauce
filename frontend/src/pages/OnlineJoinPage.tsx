import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WoodyBackground } from '../components/Shared/WoodyBackground';
import { io, Socket } from 'socket.io-client';

const OnlineJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams<{ roomCode: string }>();
  
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState(urlRoomCode?.toUpperCase() || '');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('الرجاء إدخال اسمك');
      return;
    }
    if (!roomCode.trim()) {
      setError('الرجاء إدخال رمز الغرفة');
      return;
    }

    setJoining(true);
    setError('');

    // Store player info
    const code = roomCode.toUpperCase();
    sessionStorage.setItem('isHost', 'false');
    sessionStorage.setItem('roomCode', code);
    sessionStorage.setItem('playerName', playerName.trim());

    // Connect to socket and join room
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

    let connected = false;
    const timeout = setTimeout(() => {
      if (!connected) {
        setError('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.');
        setJoining(false);
        socket.disconnect();
      }
    }, 10000);

    socket.on('connect', () => {
      console.log('🔌 Player connected to socket');
      connected = true;
      clearTimeout(timeout);
      socket.emit('join-game', {
        gameId: code,
        playerName: playerName.trim(),
        isHost: false,
      });
      // Navigate to waiting page
      navigate('/online/waiting');
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
      clearTimeout(timeout);
      setError('فشل الاتصال بالخادم. يرجى المحاولة لاحقاً.');
      setJoining(false);
      socket.disconnect();
    });

    socket.on('error', (data: { message: string }) => {
      console.error('❌ Game error:', data.message);
      clearTimeout(timeout);
      setError(data.message || 'حدث خطأ أثناء الانضمام');
      setJoining(false);
      socket.disconnect();
    });
  };

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="text-white/70 hover:text-white absolute top-4 right-4"
            >
              ✕
            </button>
            <h1 className="text-3xl font-bold text-white">انضم للعبة</h1>
          </div>

          <div className="bg-white/10 rounded-xl p-6">
            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-center">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Player Name */}
            <div className="mb-4">
              <label className="text-white/60 text-sm block mb-1">اسمك</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="أدخل اسمك"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 text-lg"
                dir="rtl"
                autoFocus
              />
            </div>

            {/* Room Code */}
            <div className="mb-6">
              <label className="text-white/60 text-sm block mb-1">رمز الغرفة</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="مثال: ABC123"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 text-lg text-center tracking-widest font-bold"
                maxLength={6}
                dir="ltr"
              />
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoin}
              disabled={joining}
              className={`w-full py-4 rounded-xl text-xl font-bold transition-colors ${
                joining
                  ? 'bg-gray-600 text-gray-400 cursor-wait'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {joining ? 'جاري الانضمام...' : '🎮 انضم'}
            </button>
          </div>
        </div>
      </div>
    </WoodyBackground>
  );
};

export default OnlineJoinPage;
