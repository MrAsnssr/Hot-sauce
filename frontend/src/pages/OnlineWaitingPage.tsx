import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WoodyBackground } from '../components/Shared/WoodyBackground';

const OnlineWaitingPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [playerName] = useState(() => sessionStorage.getItem('playerName') || 'لاعب');
  const [roomCode] = useState(() => sessionStorage.getItem('roomCode') || '');
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);

    // Check for game start (polling - in real app would use sockets)
    const checkInterval = setInterval(() => {
      const gameData = sessionStorage.getItem('onlineGame');
      if (gameData) {
        navigate('/online/game');
      }
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(checkInterval);
    };
  }, [roomCode, navigate]);

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
