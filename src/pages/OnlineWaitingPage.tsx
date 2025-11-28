import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OnlineWaitingPage: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode] = useState(localStorage.getItem('roomCode') || '');
  const [roomName] = useState(localStorage.getItem('roomName') || 'غرفة اللعبة');
  const [isHost] = useState(localStorage.getItem('isHost') === 'true');
  const [players, setPlayers] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // Mock players for demonstration
    const mockPlayers = isHost
      ? [localStorage.getItem('hostName') || 'المضيف', 'لاعب 1', 'لاعب 2']
      : [localStorage.getItem('playerName') || 'أنت', 'لاعب آخر'];

    setPlayers(mockPlayers);
  }, [isHost]);

  const handleStartGame = () => {
    setIsStarting(true);
    // In a real app, this would notify all players via Socket.io
    setTimeout(() => {
      navigate('/online/game');
    }, 2000);
  };

  const handleLeaveRoom = () => {
    // Clear room data
    localStorage.removeItem('roomCode');
    localStorage.removeItem('roomName');
    localStorage.removeItem('hostName');
    localStorage.removeItem('playerName');
    localStorage.removeItem('isHost');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            انتظار اللاعبين
          </h2>
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="text-lg font-semibold text-gray-700">{roomName}</p>
            <p className="text-sm text-gray-600 font-mono">رمز الغرفة: {roomCode}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            اللاعبون ({players.length}/8)
          </h3>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <span className="font-medium text-gray-800">{player}</span>
                {index === 0 && <span className="text-sm text-blue-600 font-medium">مضيف</span>}
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <div className="mb-4">
            <button
              onClick={handleStartGame}
              disabled={isStarting || players.length < 2}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {isStarting ? 'جاري بدء اللعبة...' : 'بدء اللعبة'}
            </button>
          </div>
        )}

        {!isHost && (
          <div className="mb-4 text-center">
            <p className="text-gray-600">انتظر حتى يبدأ المضيف اللعبة...</p>
          </div>
        )}

        <button
          onClick={handleLeaveRoom}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          مغادرة الغرفة
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            شارك رمز الغرفة مع أصدقائك: <span className="font-mono font-bold">{roomCode}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnlineWaitingPage;