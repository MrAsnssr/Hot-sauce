import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Shared/Button';
import { WoodyBackground } from '../components/Shared/WoodyBackground';

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

const TEAM_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const LocalSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([
    { id: 'team-1', name: 'الفريق الأول', color: TEAM_COLORS[0] },
    { id: 'team-2', name: 'الفريق الثاني', color: TEAM_COLORS[1] },
  ]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  
  // Safe array getters to prevent .map() errors
  const safePlayers = Array.isArray(players) ? players : [];
  const safeTeams = Array.isArray(teams) ? teams : [];

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    const player: Player = {
      id: `player-${Date.now()}`,
      name: newPlayerName.trim(),
      teamId: null,
    };
    setPlayers([...players, player]);
    setNewPlayerName('');
  };

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter((p) => p.id !== playerId));
  };

  const assignPlayerToTeam = (playerId: string, teamId: string | null) => {
    setPlayers(
      players.map((p) => (p.id === playerId ? { ...p, teamId } : p))
    );
  };

  const addTeam = () => {
    if (teams.length >= 6) return;
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: `فريق ${teams.length + 1}`,
      color: TEAM_COLORS[teams.length % TEAM_COLORS.length],
    };
    setTeams([...teams, newTeam]);
  };

  const removeTeam = (teamId: string) => {
    if (teams.length <= 2) return;
    setTeams(teams.filter((t) => t.id !== teamId));
    setPlayers(
      players.map((p) => (p.teamId === teamId ? { ...p, teamId: null } : p))
    );
  };

  const updateTeamName = (teamId: string, name: string) => {
    setTeams(teams.map((t) => (t.id === teamId ? { ...t, name } : t)));
  };

  const startGame = () => {
    const unassignedCheck = safePlayers.filter((p) => !p.teamId);
    if (unassignedCheck.length > 0) {
      alert('يجب توزيع جميع اللاعبين على الفرق');
      return;
    }
    if (safePlayers.length < 2) {
      alert('يجب إضافة لاعبين على الأقل');
      return;
    }

    // Store game config
    const gameConfig = {
      mode: 'local',
      players: safePlayers,
      teams: safeTeams.map((t) => ({
        ...t,
        players: safePlayers.filter((p) => p.teamId === t.id),
      })),
    };
    sessionStorage.setItem('gameConfig', JSON.stringify(gameConfig));
    navigate('/local/game');
  };

  const getTeamPlayers = (teamId: string) =>
    safePlayers.filter((p) => p.teamId === teamId);

  const unassignedPlayers = safePlayers.filter((p) => !p.teamId);

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white"
          >
            ← رجوع
          </button>
          <h1 className="text-3xl font-bold text-white">إعداد اللعبة المحلية</h1>
          <div className="w-16" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Players Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">إضافة اللاعبين</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="اسم اللاعب"
                className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
              <Button onClick={addPlayer} variant="primary">
                إضافة
              </Button>
            </div>

            {/* Unassigned Players */}
            {unassignedPlayers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-white/70 text-sm mb-2">لاعبون بدون فريق:</h3>
                <div className="flex flex-wrap gap-2">
                  {unassignedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="bg-white/20 rounded-lg px-3 py-2 flex items-center gap-2"
                    >
                      <span className="text-white">{player.name}</span>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-white/50 text-sm">
              أضف اللاعبين ثم اسحبهم إلى الفرق
            </p>
          </div>

          {/* Teams Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">الفرق</h2>
              {teams.length < 6 && (
                <Button onClick={addTeam} variant="secondary" size="sm">
                  + فريق جديد
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {safeTeams.map((team) => (
                <div
                  key={team.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: `${team.color}30`, borderColor: team.color, borderWidth: '2px' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    {editingTeam === team.id ? (
                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) => updateTeamName(team.id, e.target.value)}
                        onBlur={() => setEditingTeam(null)}
                        onKeyPress={(e) => e.key === 'Enter' && setEditingTeam(null)}
                        className="bg-white/20 rounded px-2 py-1 text-white focus:outline-none"
                        dir="rtl"
                        autoFocus
                      />
                    ) : (
                      <h3
                        className="text-white font-bold cursor-pointer hover:underline"
                        onClick={() => setEditingTeam(team.id)}
                      >
                        {team.name}
                      </h3>
                    )}
                    {teams.length > 2 && (
                      <button
                        onClick={() => removeTeam(team.id)}
                        className="text-white/50 hover:text-red-400 text-sm"
                      >
                        حذف
                      </button>
                    )}
                  </div>

                  {/* Team Players */}
                  <div className="min-h-[60px] bg-black/20 rounded-lg p-2">
                    {getTeamPlayers(team.id).length === 0 ? (
                      <p className="text-white/40 text-sm text-center py-2">
                        اختر لاعبين لهذا الفريق
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {getTeamPlayers(team.id).map((player) => (
                          <div
                            key={player.id}
                            className="bg-white/30 rounded px-2 py-1 text-white text-sm flex items-center gap-1"
                          >
                            {player.name}
                            <button
                              onClick={() => assignPlayerToTeam(player.id, null)}
                              className="text-white/70 hover:text-white"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add player to team buttons */}
                  {unassignedPlayers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {unassignedPlayers.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => assignPlayerToTeam(player.id, team.id)}
                          className="text-xs bg-white/20 hover:bg-white/30 rounded px-2 py-1 text-white"
                        >
                          + {player.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={startGame}
            variant="success"
            size="lg"
            className="px-12"
            disabled={safePlayers.length < 2 || unassignedPlayers.length > 0}
          >
            ابدأ اللعبة 🎮
          </Button>
        </div>
      </div>
      </div>
    </WoodyBackground>
  );
};

export default LocalSetupPage;

