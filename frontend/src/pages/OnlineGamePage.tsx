import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WoodyBackground } from '../components/Shared/WoodyBackground';
import api from '../utils/api';

// ============ TYPES ============
interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  points: number;
  timeLimit: number;
}

// ============ COMPONENT ============
const OnlineGamePage: React.FC = () => {
  const navigate = useNavigate();

  // Game data
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [round, setRound] = useState(1);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);

  // Question state
  const [phase, setPhase] = useState<'loading' | 'question' | 'results'>('loading');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);

  // ============ INIT ============
  useEffect(() => {
    const gameData = sessionStorage.getItem('onlineGame');
    const host = sessionStorage.getItem('isHost') === 'true';
    const code = sessionStorage.getItem('roomCode') || '';

    if (!code) {
      navigate('/');
      return;
    }

    setRoomCode(code);
    setIsHost(host);

    if (gameData) {
      try {
        const parsed = JSON.parse(gameData);
        setTeams(parsed.teams || []);
      } catch {
        // Use default teams
        setTeams([
          { id: 'team-1', name: 'الفريق الأزرق', color: '#3b82f6', score: 0 },
          { id: 'team-2', name: 'الفريق الأحمر', color: '#ef4444', score: 0 },
        ]);
      }
    } else {
      // Player joined - create default teams
      setTeams([
        { id: 'team-1', name: 'الفريق الأزرق', color: '#3b82f6', score: 0 },
        { id: 'team-2', name: 'الفريق الأحمر', color: '#ef4444', score: 0 },
      ]);
    }

    // Load first question
    loadQuestion();
  }, [navigate]);

  // ============ TIMER ============
  useEffect(() => {
    if (phase !== 'question' || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          showResults();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, timer]);

  // ============ GAME LOGIC ============
  const currentTeam = teams[currentTeamIndex];

  const loadQuestion = async () => {
    setPhase('loading');
    setSelectedAnswer(null);

    try {
      const res = await api.post('/games/temp/question', {});
      const q = res.data;

      let options: QuestionOption[] = [];
      if (q.options?.length > 0) {
        options = q.options.map((o: any, i: number) => ({
          id: o.id || o._id || `${i}`,
          text: o.text,
          isCorrect: o.isCorrect === true,
        }));
      } else if (q.correctAnswer) {
        options = shuffleArray([
          { id: 'correct', text: q.correctAnswer, isCorrect: true },
          { id: 'w1', text: 'خيار خاطئ ١', isCorrect: false },
          { id: 'w2', text: 'خيار خاطئ ٢', isCorrect: false },
          { id: 'w3', text: 'خيار خاطئ ٣', isCorrect: false },
        ]);
      }

      if (options.length === 0) throw new Error('No options');

      setCurrentQuestion({
        id: q._id || q.id || Date.now().toString(),
        text: q.text,
        options,
        points: q.points || 10,
        timeLimit: q.timeLimit || 30,
      });
      setTimer(q.timeLimit || 30);
      setPhase('question');
    } catch {
      // Fallback question
      setCurrentQuestion({
        id: 'fallback',
        text: 'ما هي أكبر قارة في العالم؟',
        options: shuffleArray([
          { id: '1', text: 'آسيا', isCorrect: true },
          { id: '2', text: 'أفريقيا', isCorrect: false },
          { id: '3', text: 'أوروبا', isCorrect: false },
          { id: '4', text: 'أمريكا الشمالية', isCorrect: false },
        ]),
        points: 10,
        timeLimit: 30,
      });
      setTimer(30);
      setPhase('question');
    }
  };

  const selectAnswer = (optionId: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(optionId);
  };

  const showResults = () => {
    setPhase('results');
  };

  const nextRound = () => {
    if (!currentQuestion) return;

    // Calculate score
    const correctId = currentQuestion.options.find(o => o.isCorrect)?.id;
    const isCorrect = selectedAnswer === correctId;

    if (isCorrect && currentTeam) {
      setTeams(prev =>
        prev.map(t =>
          t.id === currentTeam.id
            ? { ...t, score: t.score + currentQuestion.points }
            : t
        )
      );
    }

    // Next round
    const nextIndex = (currentTeamIndex + 1) % Math.max(teams.length, 1);
    setCurrentTeamIndex(nextIndex);
    if (nextIndex === 0) setRound(r => r + 1);

    loadQuestion();
  };

  const endGame = () => {
    if (confirm('هل أنت متأكد من إنهاء اللعبة؟')) {
      sessionStorage.removeItem('onlineGame');
      sessionStorage.removeItem('roomCode');
      sessionStorage.removeItem('isHost');
      sessionStorage.removeItem('playerName');
      navigate('/');
    }
  };

  // ============ HELPERS ============
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // ============ RENDER ============
  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button onClick={endGame} className="text-white/60 hover:text-white">
              ✕ خروج
            </button>
            <div className="text-white">
              <span className="text-yellow-400 font-bold">{roomCode}</span>
              <span className="text-white/60 mr-2"> | الجولة {round}</span>
              {isHost && <span className="text-green-400 text-sm mr-2">(المضيف)</span>}
            </div>
            <div className="w-16" />
          </div>

          {/* Scoreboard */}
          <div className="flex justify-center gap-6 mb-6">
            {teams.map((team, i) => (
              <div
                key={team.id}
                className={`rounded-xl px-6 py-4 text-center min-w-[140px] ${
                  i === currentTeamIndex ? 'ring-4 ring-yellow-400 scale-105' : ''
                }`}
                style={{ backgroundColor: team.color }}
              >
                <div className="text-white font-bold">{team.name}</div>
                <div className="text-4xl font-bold text-white">{team.score}</div>
              </div>
            ))}
          </div>

          {/* Current Team */}
          {currentTeam && (
            <div
              className="text-center mb-4 py-2 rounded-lg"
              style={{ backgroundColor: `${currentTeam.color}60` }}
            >
              <span className="text-white">دور: <strong>{currentTeam.name}</strong></span>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            
            {/* LOADING */}
            {phase === 'loading' && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-white text-xl">جاري تحميل السؤال...</p>
              </div>
            )}

            {/* QUESTION */}
            {phase === 'question' && currentQuestion && (
              <>
                {/* Timer */}
                <div className="text-center mb-4">
                  <span className={`text-4xl font-bold ${timer <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timer}
                  </span>
                </div>

                {/* Question Text */}
                <h2 className="text-2xl font-bold text-white text-center mb-8">
                  {currentQuestion.text}
                </h2>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {currentQuestion.options.map(opt => {
                    const selected = selectedAnswer === opt.id;
                    const answered = !!selectedAnswer;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectAnswer(opt.id)}
                        disabled={answered}
                        className={`p-4 rounded-xl text-white text-lg transition-all ${
                          selected ? 'bg-blue-600 ring-4 ring-blue-400' :
                          answered ? 'bg-white/10 opacity-50 cursor-not-allowed' :
                          'bg-white/20 hover:bg-white/30'
                        }`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                {/* Show Results Button */}
                {selectedAnswer && (
                  <div className="text-center">
                    <button
                      onClick={showResults}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-xl font-bold"
                    >
                      كشف الإجابة
                    </button>
                  </div>
                )}
              </>
            )}

            {/* RESULTS */}
            {phase === 'results' && currentQuestion && (
              <>
                <h2 className="text-2xl font-bold text-white text-center mb-4">
                  {currentQuestion.text}
                </h2>

                {/* Options with Results */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {currentQuestion.options.map(opt => {
                    const isCorrect = opt.isCorrect;
                    const wasSelected = selectedAnswer === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`p-4 rounded-xl text-white text-lg text-center ${
                          isCorrect ? 'bg-green-600' :
                          wasSelected ? 'bg-red-600' :
                          'bg-white/20'
                        }`}
                      >
                        {opt.text}
                        {isCorrect && ' ✓'}
                      </div>
                    );
                  })}
                </div>

                {/* Result Message */}
                <div className="text-center mb-6">
                  <div className="text-2xl">
                    {selectedAnswer && currentQuestion.options.find(o => o.id === selectedAnswer)?.isCorrect ? (
                      <span className="text-green-400">إجابة صحيحة! 🎉 +{currentQuestion.points}</span>
                    ) : (
                      <span className="text-red-400">
                        {!selectedAnswer ? 'انتهى الوقت! ⏰' : 'إجابة خاطئة 😢'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Next Button */}
                <div className="text-center">
                  <button
                    onClick={nextRound}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-xl font-bold"
                  >
                    السؤال التالي ←
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </WoodyBackground>
  );
};

export default OnlineGamePage;
