import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Shared/Button';
import { WoodyBackground } from '../components/Shared/WoodyBackground';

const OnlineJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams<{ roomCode: string }>();
  const [playerName, setPlayerName] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState(roomCode || '');

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('الرجاء إدخال اسمك');
      return;
    }

    const code = roomCode || manualCode;
    if (!code.trim()) {
      setError('الرجاء إدخال رمز الغرفة');
      return;
    }

    setJoining(true);
    setError('');

    try {
      // Store player info
      sessionStorage.setItem('playerName', playerName);
      sessionStorage.setItem('roomCode', code.toUpperCase());
      sessionStorage.setItem('isHost', 'false');

      // TODO: Connect to socket and join room
      // For now, navigate to waiting room
      navigate('/online/waiting');
    } catch (err) {
      setError('فشل الانضمام للغرفة');
      setJoining(false);
    }
  };

  return (
    <WoodyBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">انضم للعبة</h1>
          {roomCode && (
            <p className="text-white/70">
              رمز الغرفة: <span className="text-yellow-400 font-bold">{roomCode}</span>
            </p>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          {!roomCode && (
            <div className="mb-4">
              <label className="block text-white mb-2">رمز الغرفة</label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="أدخل الرمز"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 text-center text-2xl tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
                maxLength={6}
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-white mb-2">اسمك</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="أدخل اسمك"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="rtl"
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>

          {error && (
            <div className="text-red-400 text-center mb-4">{error}</div>
          )}

          <Button
            onClick={handleJoin}
            variant="primary"
            size="lg"
            className="w-full"
            disabled={joining}
          >
            {joining ? 'جاري الانضمام...' : 'انضم'}
          </Button>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
      </div>
    </WoodyBackground>
  );
};

export default OnlineJoinPage;

