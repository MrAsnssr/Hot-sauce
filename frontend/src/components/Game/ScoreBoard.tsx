import React from 'react';
import { Team } from '../../types/game.types';

interface ScoreBoardProps {
  teams: Team[];
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ teams }) => {
  return (
    <div className="flex gap-4 justify-center mb-6">
      {teams.map((team) => (
        <div
          key={team.id}
          className="bg-white/20 backdrop-blur-sm rounded-xl p-6 min-w-[200px] text-center"
        >
          <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
          <div className="text-5xl font-bold text-yellow-300">{team.score}</div>
          <div className="text-sm text-white/80 mt-2">
            {team.role === 'subject_picker' ? 'اختيار الموضوع' : 'اختيار نوع السؤال'}
          </div>
        </div>
      ))}
    </div>
  );
};

