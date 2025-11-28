import React from 'react';
import { Button } from '../Shared/Button';
import { Player } from '../../types/game.types';

interface PlayerSelectorProps {
  onPlayerCreate: (name: string) => void;
  players: Player[];
}

export const PlayerSelector: React.FC<PlayerSelectorProps> = ({ onPlayerCreate, players }) => {
  const [playerName, setPlayerName] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onPlayerCreate(playerName.trim());
      setPlayerName('');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">إضافة لاعب</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="اسم اللاعب"
          className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
          dir="rtl"
        />
        <Button type="submit" variant="primary">
          إضافة
        </Button>
      </form>
      {players.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white mb-2">اللاعبون:</h3>
          <div className="flex flex-wrap gap-2">
            {players.map((player) => (
              <span
                key={player.id}
                className="px-3 py-1 bg-white/20 rounded-lg text-white"
                style={{ borderColor: player.color, borderWidth: 2 }}
              >
                {player.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

