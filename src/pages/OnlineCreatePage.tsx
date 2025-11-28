import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnlineCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [hostName, setHostName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !hostName.trim()) return;

    setIsCreating(true);

    try {
      const roomCode = generateRoomCode();

      // Store room info in localStorage for now
      localStorage.setItem('roomCode', roomCode);
      localStorage.setItem('roomName', roomName);
      localStorage.setItem('hostName', hostName);
      localStorage.setItem('isHost', 'true');

      // In a real app, this would create the room via Socket.io
      // For now, just navigate to waiting room
      navigate('/online/waiting');
    } catch (error) {
      console.error('Error creating room:', error);
      alert('حدث خطأ في إنشاء الغرفة');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          إنشاء غرفة جديدة
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الغرفة
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="أدخل اسم الغرفة"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المضيف
            </label>
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="أدخل اسمك"
            />
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={!roomName.trim() || !hostName.trim() || isCreating}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {isCreating ? 'جاري الإنشاء...' : 'إنشاء الغرفة'}
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            العودة
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineCreatePage;