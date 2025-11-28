import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WoodyBackground } from '../components/Shared/WoodyBackground';

const PLAYER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
}

const LocalSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    const colorIndex = players.length % PLAYER_COLORS.length;
    setPlayers([...players, {
      id: `player-${Date.now()}`,
      name: newPlayerName.trim(),
      color: PLAYER_COLORS[colorIndex],
      score: 0,
    }]);
    setNewPlayerName('');
  };

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const canStart = players.length >= 2;

  const startGame = () => {
    if (!canStart) return;
    
    const gameData = {
      players: players.map(p => ({ ...p, score: 0 })),
    };
    
    sessionStorage.setItem('localGame', JSON.stringify(gameData));
    navigate('/local/game');
  };

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate('/')} className="text-white/70 hover:text-white">
              ← رجوع
            </button>
            <h1 className="text-3xl font-bold text-white">إعداد اللعبة</h1>
            <div className="w-16" />
          </div>

          {/* Add Player */}
          <div className="bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">إضافة لاعب</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="اسم اللاعب"
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50"
                dir="rtl"
              />
              <button
                onClick={addPlayer}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
              >
                إضافة
              </button>
            </div>
          </div>

          {/* Players List */}
          <div className="bg-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">اللاعبون ({players.length})</h2>
            {players.length === 0 ? (
              <p className="text-white/40 text-center py-8">لا يوجد لاعبين. أضف لاعبين للبدء.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className="rounded-xl p-4 flex items-center justify-between"
                    style={{ backgroundColor: `${player.color}40`, borderColor: player.color, borderWidth: 2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: player.color }}
                      >
                        {index + 1}
                      </div>
                      <span className="text-white font-bold">{player.name}</span>
                    </div>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-red-400 hover:text-red-300"
                      title="إزالة اللاعب"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={startGame}
              disabled={!canStart}
              className={`px-12 py-4 rounded-xl text-xl font-bold transition-all ${
                canStart
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              🎮 ابدأ اللعبة
            </button>
            {!canStart && (
              <p className="text-white/50 text-sm mt-2">
                أضف لاعبين على الأقل (2 لاعبين)
              </p>
            )}
          </div>
        </div>
      </div>
    </WoodyBackground>
  );
};

export default LocalSetupPage;
