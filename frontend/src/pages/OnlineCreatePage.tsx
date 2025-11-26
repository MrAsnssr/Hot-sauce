import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Shared/Button';
import { Subject, QuestionType } from '../types/question.types';
import api from '../utils/api';

interface Team {
  id: string;
  name: string;
  color: string;
}

interface JoinedPlayer {
  id: string;
  name: string;
  teamId: string | null;
}

const TEAM_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

const OnlineCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [roomLink, setRoomLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Game configuration
  const [teams, setTeams] = useState<Team[]>([
    { id: 'team-1', name: 'الفريق الأول', color: TEAM_COLORS[0] },
    { id: 'team-2', name: 'الفريق الثاني', color: TEAM_COLORS[1] },
  ]);
  const [extraSauceEnabled, setExtraSauceEnabled] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Joined players
  const [joinedPlayers, setJoinedPlayers] = useState<JoinedPlayer[]>([]);

  useEffect(() => {
    // Generate room code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setRoomLink(`${window.location.origin}/online/join/${code}`);
    
    // Store room info
    sessionStorage.setItem('hostRoomCode', code);
    sessionStorage.setItem('isHost', 'true');
    
    // Fetch game data
    fetchGameData();
    
    // TODO: Connect to socket and listen for players joining
  }, []);

  const fetchGameData = async () => {
    try {
      const [subjectsRes, typesRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/question-types'),
      ]);
      setSubjects(subjectsRes.data);
      setQuestionTypes(typesRes.data);
      // Select all by default
      setSelectedSubjects(subjectsRes.data.map((s: Subject) => s.id));
      setSelectedTypes(typesRes.data.map((t: QuestionType) => t.id));
    } catch (error) {
      console.error('Error fetching data:', error);
      // Mock data
      const mockSubjects = [
        { id: '1', name: 'History', nameAr: 'التاريخ' },
        { id: '2', name: 'Science', nameAr: 'العلوم' },
        { id: '3', name: 'Sports', nameAr: 'الرياضة' },
        { id: '4', name: 'Geography', nameAr: 'الجغرافيا' },
      ];
      const mockTypes = [
        { id: '1', name: 'Multiple Choice', nameAr: 'اختيار من متعدد', description: '' },
        { id: '2', name: 'True/False', nameAr: 'صح أو خطأ', description: '' },
      ];
      setSubjects(mockSubjects as Subject[]);
      setQuestionTypes(mockTypes as QuestionType[]);
      setSelectedSubjects(mockSubjects.map(s => s.id));
      setSelectedTypes(mockTypes.map(t => t.id));
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const assignPlayerToTeam = (playerId: string, teamId: string) => {
    setJoinedPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, teamId } : p))
    );
  };

  const startGame = () => {
    if (joinedPlayers.length < 2) {
      // For testing, add mock players
      const mockPlayers: JoinedPlayer[] = [
        { id: 'p1', name: 'لاعب 1', teamId: 'team-1' },
        { id: 'p2', name: 'لاعب 2', teamId: 'team-2' },
      ];
      setJoinedPlayers(mockPlayers);
    }

    const unassigned = joinedPlayers.filter((p) => !p.teamId);
    if (unassigned.length > 0 && joinedPlayers.length >= 2) {
      alert('يجب توزيع جميع اللاعبين على الفرق');
      return;
    }

    // Store game config
    const gameConfig = {
      mode: 'online',
      roomCode,
      teams: teams.map((t) => ({
        ...t,
        players: joinedPlayers.filter((p) => p.teamId === t.id),
        score: 0,
      })),
      settings: {
        extraSauceEnabled,
        selectedSubjects,
        selectedTypes,
      },
    };
    sessionStorage.setItem('gameConfig', JSON.stringify(gameConfig));
    navigate('/online/game');
  };

  return (
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
          <h1 className="text-3xl font-bold text-white">إنشاء غرفة</h1>
          <div className="w-16" />
        </div>

        {/* Room Link */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">شارك الرابط مع أصدقائك</h2>
          
          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <div className="text-white/60 text-sm mb-1">رمز الغرفة:</div>
            <div className="text-4xl font-bold text-yellow-400 tracking-widest text-center">
              {roomCode}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={roomLink}
              readOnly
              className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white text-sm"
              dir="ltr"
            />
            <Button onClick={copyLink} variant={copied ? 'success' : 'primary'}>
              {copied ? 'تم النسخ!' : 'نسخ'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Game Settings */}
          <div className="space-y-6">
            {/* Subjects */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">المواضيع</h3>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => toggleSubject(subject.id)}
                    className={`px-4 py-2 rounded-lg transition-all ${
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

            {/* Question Types */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">أنواع الأسئلة</h3>
              <div className="flex flex-wrap gap-2">
                {questionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleType(type.id)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedTypes.includes(type.id)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/20 text-white/60'
                    }`}
                  >
                    {type.nameAr}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Sauce */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={extraSauceEnabled}
                  onChange={(e) => setExtraSauceEnabled(e.target.checked)}
                  className="ml-3 w-5 h-5"
                />
                <div>
                  <span className="font-bold">🌶️ الصلصة الإضافية</span>
                  <p className="text-white/60 text-sm">
                    قوى خارقة وصلصات سلبية لكل جولة
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Players & Teams */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              اللاعبون ({joinedPlayers.length})
            </h3>

            {joinedPlayers.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                في انتظار انضمام اللاعبين...
                <div className="mt-4 text-sm">
                  شارك الرابط أعلاه مع أصدقائك
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded-lg p-4"
                    style={{ backgroundColor: `${team.color}30` }}
                  >
                    <h4 className="text-white font-bold mb-2">{team.name}</h4>
                    <div className="min-h-[40px]">
                      {joinedPlayers
                        .filter((p) => p.teamId === team.id)
                        .map((player) => (
                          <span
                            key={player.id}
                            className="inline-block bg-white/30 rounded px-2 py-1 text-white text-sm mr-2 mb-1"
                          >
                            {player.name}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}

                {/* Unassigned */}
                {joinedPlayers.filter((p) => !p.teamId).length > 0 && (
                  <div className="text-white/60 text-sm">
                    بدون فريق:{' '}
                    {joinedPlayers
                      .filter((p) => !p.teamId)
                      .map((p) => p.name)
                      .join('، ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={startGame}
            variant="success"
            size="lg"
            className="px-12"
          >
            ابدأ اللعبة 🚀
          </Button>
          <p className="text-white/50 text-sm mt-2">
            {joinedPlayers.length < 2
              ? 'سيتم إضافة لاعبين تجريبيين'
              : `${joinedPlayers.length} لاعبين جاهزين`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnlineCreatePage;

