import React from 'react';
import { Player } from '../../types/game.types';

interface ScoreBoardProps {
  teams: Player[]; // Keep prop name as 'teams' for backward compatibility with GameBoard
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ teams }) => {
  return (
    <div className="flex gap-4 justify-center mb-6 flex-wrap">
      {teams.map((player) => (
        <div
          key={player.id}
          className="bg-white/20 backdrop-blur-sm rounded-xl p-6 min-w-[200px] text-center"
          style={{ borderColor: player.color, borderWidth: 2 }}
        >
          <h3 className="text-xl font-bold text-white mb-2">{player.name}</h3>
          <div className="text-5xl font-bold text-yellow-300">{player.score}</div>
        </div>
      ))}
    </div>
  );
};

