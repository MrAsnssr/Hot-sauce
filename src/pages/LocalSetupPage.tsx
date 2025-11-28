import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LocalSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');

  const handleStartGame = () => {
    if (team1Name.trim() && team2Name.trim()) {
      // Store team names in localStorage for the game
      localStorage.setItem('team1Name', team1Name);
      localStorage.setItem('team2Name', team2Name);
      localStorage.setItem('gameMode', 'local');
      navigate('/local/game');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          إعداد اللعبة المحلية
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الفريق الأول
            </label>
            <input
              type="text"
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل اسم الفريق الأول"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الفريق الثاني
            </label>
            <input
              type="text"
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل اسم الفريق الثاني"
            />
          </div>

          <button
            onClick={handleStartGame}
            disabled={!team1Name.trim() || !team2Name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            بدء اللعبة
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

export default LocalSetupPage;
