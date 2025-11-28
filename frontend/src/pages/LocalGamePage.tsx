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

interface Subject {
  id: string;
  nameAr: string;
}

// ============ COMPONENT ============
const LocalGamePage: React.FC = () => {
  const navigate = useNavigate();

  // Game data
  const [teams, setTeams] = useState<Team[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [round, setRound] = useState(1);
  const [pickingTeamIndex, setPickingTeamIndex] = useState(0);

  // Current round state
  const [phase, setPhase] = useState<'pick_subject' | 'answering' | 'results'>('pick_subject');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [teamAnswers, setTeamAnswers] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  // ============ INIT ============
  useEffect(() => {
    const data = sessionStorage.getItem('localGame');
    if (!data) {
      navigate('/');
      return;
    }
    try {
      const parsed = JSON.parse(data);
      setTeams(parsed.teams || []);
      loadSubjects();
    } catch {
      navigate('/');
    }
  }, [navigate]);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      const mapped = (res.data || []).map((s: any) => ({
        id: s._id || s.id,
        nameAr: s.nameAr || s.name,
      }));
      setSubjects(mapped.length > 0 ? mapped : [
        { id: '1', nameAr: 'ثقافة عامة' },
      ]);
    } catch {
      setSubjects([{ id: '1', nameAr: 'ثقافة عامة' }]);
    }
  };

  // ============ TIMER ============
  useEffect(() => {
    if (phase !== 'answering' || timer <= 0) return;
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
  const pickingTeam = teams[pickingTeamIndex];
  const opposingTeam = teams[(pickingTeamIndex + 1) % teams.length];

  const selectSubject = async (subjectId: string) => {
    setLoading(true);
    try {
      const res = await api.post('/games/temp/question', { subjectId });
      const q = res.data;
      
      // Build options
      let options: QuestionOption[] = [];
      if (q.options?.length > 0) {
        options = q.options.map((o: any, i: number) => ({
          id: o.id || o._id || `${i}`,
          text: o.text,
          isCorrect: o.isCorrect === true,
        }));
      } else if (q.correctAnswer) {
        // Generate options for fill-blank
        options = shuffleArray([
          { id: 'correct', text: q.correctAnswer, isCorrect: true },
          { id: 'w1', text: 'خيار خاطئ ١', isCorrect: false },
          { id: 'w2', text: 'خيار خاطئ ٢', isCorrect: false },
          { id: 'w3', text: 'خيار خاطئ ٣', isCorrect: false },
        ]);
      }

      if (options.length === 0) {
        throw new Error('No options');
      }

      setCurrentQuestion({
        id: q._id || q.id || Date.now().toString(),
        text: q.text,
        options,
        points: q.points || 10,
        timeLimit: q.timeLimit || 30,
      });
      setTeamAnswers({});
      setTimer(q.timeLimit || 30);
      setPhase('answering');
    } catch (err) {
      console.error('Error loading question:', err);
      // Use fallback question
      setCurrentQuestion({
        id: 'fallback',
        text: 'ما هي عاصمة المملكة العربية السعودية؟',
        options: shuffleArray([
          { id: '1', text: 'الرياض', isCorrect: true },
          { id: '2', text: 'جدة', isCorrect: false },
          { id: '3', text: 'مكة', isCorrect: false },
          { id: '4', text: 'الدمام', isCorrect: false },
        ]),
        points: 10,
        timeLimit: 30,
      });
      setTeamAnswers({});
      setTimer(30);
      setPhase('answering');
    } finally {
      setLoading(false);
    }
  };

  const answerQuestion = (teamId: string, optionId: string) => {
    if (teamAnswers[teamId]) return; // Already answered
    setTeamAnswers(prev => ({ ...prev, [teamId]: optionId }));
  };

  const showResults = () => {
    setPhase('results');
  };

  const nextRound = () => {
    if (!currentQuestion) return;

    // Calculate scores
    const correctId = currentQuestion.options.find(o => o.isCorrect)?.id;
    setTeams(prev => prev.map(team => {
      const answered = teamAnswers[team.id];
      const correct = answered === correctId;
      return { ...team, score: team.score + (correct ? currentQuestion.points : 0) };
    }));

    // Next round
    const nextPicker = (pickingTeamIndex + 1) % teams.length;
    setPickingTeamIndex(nextPicker);
    if (nextPicker === 0) setRound(r => r + 1);
    
    setCurrentQuestion(null);
    setTeamAnswers({});
    setPhase('pick_subject');
  };

  const allAnswered = teams.every(t => teamAnswers[t.id]);

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
  if (teams.length === 0) {
    return (
      <WoodyBackground>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white text-2xl">جاري التحميل...</p>
        </div>
      </WoodyBackground>
    );
  }

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => {
                if (confirm('إنهاء اللعبة؟')) {
                  sessionStorage.removeItem('localGame');
                  navigate('/');
                }
              }}
              className="text-white/60 hover:text-white"
            >
              ✕ خروج
            </button>
            <div className="text-white text-xl font-bold">الجولة {round}</div>
            <div className="w-16" />
          </div>

          {/* Scoreboard */}
          <div className="flex justify-center gap-6 mb-6">
            {teams.map((team, i) => (
              <div
                key={team.id}
                className={`rounded-xl px-6 py-4 text-center min-w-[140px] ${
                  phase === 'pick_subject' && i === pickingTeamIndex ? 'ring-4 ring-yellow-400 scale-105' : ''
                }`}
                style={{ backgroundColor: team.color }}
              >
                <div className="text-white font-bold">{team.name}</div>
                <div className="text-4xl font-bold text-white">{team.score}</div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            
            {/* PICK SUBJECT */}
            {phase === 'pick_subject' && (
              <>
                <div className="text-center mb-6">
                  <span className="text-white text-xl">
                    <strong style={{ color: pickingTeam?.color }}>{pickingTeam?.name}</strong> يختار الموضوع
                  </span>
                </div>
                
                {loading ? (
                  <p className="text-center text-white">جاري التحميل...</p>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4">
                    {subjects.map(subject => (
                      <button
                        key={subject.id}
                        onClick={() => selectSubject(subject.id)}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-6 py-4 text-lg font-bold transition-transform hover:scale-105"
                      >
                        {subject.nameAr}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ANSWERING */}
            {phase === 'answering' && currentQuestion && (
              <>
                {/* Timer */}
                <div className="text-center mb-4">
                  <span className={`text-4xl font-bold ${timer <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timer}
                  </span>
                </div>

                {/* Question */}
                <h2 className="text-2xl font-bold text-white text-center mb-8">
                  {currentQuestion.text}
                </h2>

                {/* Each Team Answers */}
                {teams.map(team => (
                  <div key={team.id} className="mb-6">
                    <div
                      className="text-center py-2 rounded-lg mb-3"
                      style={{ backgroundColor: `${team.color}60` }}
                    >
                      <span className="text-white font-bold">{team.name}</span>
                      {teamAnswers[team.id] && <span className="text-green-300 mr-2"> ✓</span>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestion.options.map(opt => {
                        const selected = teamAnswers[team.id] === opt.id;
                        const answered = !!teamAnswers[team.id];
                        return (
                          <button
                            key={opt.id}
                            onClick={() => answerQuestion(team.id, opt.id)}
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
                  </div>
                ))}

                {/* Show Results Button */}
                {allAnswered && (
                  <div className="text-center mt-4">
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

                {/* Correct Answer */}
                <div className="bg-green-600/30 border-2 border-green-500 rounded-xl p-4 mb-6 text-center">
                  <p className="text-green-400 text-sm">الإجابة الصحيحة:</p>
                  <p className="text-white text-xl font-bold">
                    {currentQuestion.options.find(o => o.isCorrect)?.text}
                  </p>
                </div>

                {/* Team Results */}
                {teams.map(team => {
                  const answer = teamAnswers[team.id];
                  const selected = currentQuestion.options.find(o => o.id === answer);
                  const correct = selected?.isCorrect;
                  return (
                    <div
                      key={team.id}
                      className={`mb-3 p-4 rounded-xl ${correct ? 'bg-green-600/30' : 'bg-red-600/30'}`}
                    >
                      <div className="flex justify-between">
                        <span className="text-white font-bold">{team.name}</span>
                        <span className={correct ? 'text-green-400' : 'text-red-400'}>
                          {!answer ? 'لم يجب ❌' : correct ? `صحيح ✓ +${currentQuestion.points}` : 'خطأ ❌'}
                        </span>
                      </div>
                      {answer && (
                        <p className="text-white/60 text-sm">اختار: {selected?.text}</p>
                      )}
                    </div>
                  );
                })}

                {/* Next Round */}
                <div className="text-center mt-6">
                  <button
                    onClick={nextRound}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-xl font-bold"
                  >
                    الجولة التالية ←
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

export default LocalGamePage;
