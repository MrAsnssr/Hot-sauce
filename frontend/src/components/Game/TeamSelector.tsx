import React from 'react';
import { Button } from '../Shared/Button';

interface TeamSelectorProps {
  onTeamCreate: (name: string) => void;
  teams: Array<{ id: string; name: string }>;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({ onTeamCreate, teams }) => {
  const [teamName, setTeamName] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      onTeamCreate(teamName.trim());
      setTeamName('');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">إضافة لاعب</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="اسم اللاعب"
          className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
          dir="rtl"
        />
        <Button type="submit" variant="primary">
          إضافة
        </Button>
      </form>
      {teams.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white mb-2">اللاعبون:</h3>
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <span
                key={team.id}
                className="px-3 py-1 bg-white/20 rounded-lg text-white"
              >
                {team.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

