import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WoodyBackground } from '../components/Shared/WoodyBackground';

const OnlineWaitingPage: React.FC = () => {
  const navigate = useNavigate();
  const [playerName] = useState(() => sessionStorage.getItem('playerName') || 'لاعب');
  const [roomCode] = useState(() => sessionStorage.getItem('roomCode') || '');

  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    // TODO: Connect to socket and wait for game to start
    // For now, show waiting screen
  }, [roomCode, navigate]);

  return (
    <WoodyBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <div className="text-6xl mb-6 animate-pulse">⏳</div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            مرحباً، {playerName}!
          </h1>
          
          <p className="text-white/70 mb-6">
            أنت في الغرفة: <span className="text-yellow-400 font-bold">{roomCode}</span>
          </p>

          <div className="bg-black/20 rounded-lg p-4 mb-6">
            <p className="text-white/80">
              في انتظار بدء اللعبة...
            </p>
            <p className="text-white/50 text-sm mt-2">
              سيبدأ المضيف اللعبة قريباً
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white text-sm"
          >
            مغادرة الغرفة
          </button>
        </div>
      </div>
      </div>
    </WoodyBackground>
  );
};

export default OnlineWaitingPage;

