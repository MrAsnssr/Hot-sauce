import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WoodyBackground } from '../components/Shared/WoodyBackground';

const TEAM_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

interface Player {
  id: string;
  name: string;
  teamId: string | null;
}

interface Team {
  id: string;
  name: string;
  color: string;
}

const LocalSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams] = useState<Team[]>([
    { id: 'team-1', name: 'الفريق الأزرق', color: TEAM_COLORS[0] },
    { id: 'team-2', name: 'الفريق الأحمر', color: TEAM_COLORS[1] },
  ]);
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    setPlayers([...players, {
      id: `player-${Date.now()}`,
      name: newPlayerName.trim(),
      teamId: null,
    }]);
    setNewPlayerName('');
  };

  const assignToTeam = (playerId: string, teamId: string) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, teamId: teamId || null } : p
    ));
  };

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const unassignedPlayers = players.filter(p => !p.teamId);
  const getTeamPlayers = (teamId: string) => players.filter(p => p.teamId === teamId);

  const canStart = players.length >= 2 && unassignedPlayers.length === 0;

  const startGame = () => {
    if (!canStart) return;
    
    const gameData = {
      teams: teams.map(t => ({
        ...t,
        players: getTeamPlayers(t.id),
        score: 0,
      })),
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
            
            {/* Unassigned Players */}
            {unassignedPlayers.length > 0 && (
              <div className="mt-4">
                <p className="text-white/60 text-sm mb-2">اختر فريق للاعبين:</p>
                <div className="flex flex-wrap gap-2">
                  {unassignedPlayers.map(player => (
                    <div key={player.id} className="bg-white/20 rounded-lg p-2 flex items-center gap-2">
                      <span className="text-white">{player.name}</span>
                      {teams.map(team => (
                        <button
                          key={team.id}
                          onClick={() => assignToTeam(player.id, team.id)}
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: team.color }}
                          title={team.name}
                        />
                      ))}
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="text-red-400 hover:text-red-300 mr-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Teams */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {teams.map(team => (
              <div
                key={team.id}
                className="rounded-xl p-4"
                style={{ backgroundColor: `${team.color}40`, borderColor: team.color, borderWidth: 2 }}
              >
                <h3 className="text-white font-bold mb-3">{team.name}</h3>
                <div className="min-h-[80px]">
                  {getTeamPlayers(team.id).length === 0 ? (
                    <p className="text-white/40 text-sm">لا يوجد لاعبين</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {getTeamPlayers(team.id).map(player => (
                        <div
                          key={player.id}
                          className="bg-white/30 rounded px-2 py-1 text-white text-sm flex items-center gap-1"
                        >
                          {player.name}
                          <button
                            onClick={() => assignToTeam(player.id, '')}
                            onMouseDown={(e) => e.preventDefault()}
                            className="text-white/60 hover:text-white"
                            title="إزالة من الفريق"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
                أضف لاعبين ووزعهم على الفرق
              </p>
            )}
          </div>
        </div>
      </div>
    </WoodyBackground>
  );
};

export default LocalSetupPage;
