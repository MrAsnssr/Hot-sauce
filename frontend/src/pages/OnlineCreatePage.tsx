import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WoodyBackground } from '../components/Shared/WoodyBackground';
import api from '../utils/api';

const TEAM_COLORS = ['#3b82f6', '#ef4444'];

interface Subject {
  id: string;
  nameAr: string;
}

const OnlineCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Room setup
  const [roomCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);
  
  // Teams
  const [team1Name, setTeam1Name] = useState('الفريق الأزرق');
  const [team2Name, setTeam2Name] = useState('الفريق الأحمر');
  
  // Settings
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  // Players (simulated for now)
  const [players, setPlayers] = useState<{id: string, name: string, team: number}[]>([]);

  useEffect(() => {
    loadSubjects();
    
    // Store host info
    sessionStorage.setItem('isHost', 'true');
    sessionStorage.setItem('roomCode', roomCode);
    
    // Simulate players joining (in real app, this would be socket-based)
    const mockInterval = setInterval(() => {
      // This would be replaced with actual socket listening
    }, 1000);
    
    return () => clearInterval(mockInterval);
  }, [roomCode]);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      const mapped = (res.data || []).map((s: any) => ({
        id: s._id || s.id,
        nameAr: s.nameAr || s.name,
      }));
      setSubjects(mapped);
      // Select all by default
      setSelectedSubjects(mapped.map((s: Subject) => s.id));
    } catch {
      setSubjects([{ id: '1', nameAr: 'ثقافة عامة' }]);
      setSelectedSubjects(['1']);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/online/join/${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const startGame = () => {
    // Create game config
    const gameData = {
      roomCode,
      isHost: true,
      teams: [
        { id: 'team-1', name: team1Name, color: TEAM_COLORS[0], score: 0, players: [] },
        { id: 'team-2', name: team2Name, color: TEAM_COLORS[1], score: 0, players: [] },
      ],
      selectedSubjects,
      players,
    };
    
    sessionStorage.setItem('onlineGame', JSON.stringify(gameData));
    navigate('/online/game');
  };

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/')} className="text-white/70 hover:text-white">
              ← رجوع
            </button>
            <h1 className="text-3xl font-bold text-white">إنشاء غرفة</h1>
            <div className="w-16" />
          </div>

          {/* Room Code */}
          <div className="bg-white/10 rounded-xl p-6 mb-6 text-center">
            <p className="text-white/60 mb-2">رمز الغرفة:</p>
            <div className="text-5xl font-bold text-yellow-400 tracking-widest mb-4">
              {roomCode}
            </div>
            <button
              onClick={copyLink}
              className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? '✓ تم النسخ!' : 'نسخ الرابط'}
            </button>
          </div>

          {/* Team Names */}
          <div className="bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">أسماء الفرق</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-sm">الفريق الأول</label>
                <input
                  type="text"
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-blue-600/30 text-white border-2 border-blue-500"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm">الفريق الثاني</label>
                <input
                  type="text"
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-red-600/30 text-white border-2 border-red-500"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">المواضيع</h2>
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => toggleSubject(subject.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedSubjects.includes(subject.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/20 text-white/60'
                  }`}
                >
                  {subject.nameAr}
                </button>
              ))}
            </div>
          </div>

          {/* Players */}
          <div className="bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              اللاعبون ({players.length})
            </h2>
            {players.length === 0 ? (
              <p className="text-white/50 text-center py-4">
                في انتظار انضمام اللاعبين...
                <br />
                <span className="text-sm">شارك رمز الغرفة مع أصدقائك</span>
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {players.map(player => (
                  <span
                    key={player.id}
                    className="bg-white/20 rounded px-3 py-1 text-white"
                  >
                    {player.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              🚀 ابدأ اللعبة
            </button>
            <p className="text-white/50 text-sm mt-2">
              يمكنك البدء حتى بدون لاعبين للتجربة
            </p>
          </div>
        </div>
      </div>
    </WoodyBackground>
  );
};

export default OnlineCreatePage;
