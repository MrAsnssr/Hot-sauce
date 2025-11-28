import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const OnlineJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams<{ roomCode: string }>();
  const [roomCode, setRoomCode] = useState(urlRoomCode || '');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !playerName.trim()) return;

    setIsJoining(true);

    try {
      // Store player info in localStorage
      localStorage.setItem('roomCode', roomCode.toUpperCase());
      localStorage.setItem('playerName', playerName);
      localStorage.setItem('isHost', 'false');

      // In a real app, this would join the room via Socket.io
      // For now, just navigate to waiting room
      navigate('/online/waiting');
    } catch (error) {
      console.error('Error joining room:', error);
      alert('حدث خطأ في الانضمام للغرفة. تأكد من صحة رمز الغرفة.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          الانضمام إلى غرفة
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رمز الغرفة
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-wider"
              placeholder="ABC123"
              maxLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسمك
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل اسمك"
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={!roomCode.trim() || !playerName.trim() || isJoining}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {isJoining ? 'جاري الانضمام...' : 'انضمام للغرفة'}
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            العودة
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            أو <button
              onClick={() => navigate('/online/create')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              أنشئ غرفة جديدة
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnlineJoinPage;
