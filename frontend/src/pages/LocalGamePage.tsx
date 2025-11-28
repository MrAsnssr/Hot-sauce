import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { WoodyBackground } from '../components/Shared/WoodyBackground';
import { HARDCODED_QUESTION_TYPES } from '../constants/questionTypes';
import api from '../utils/api';

// ============ TYPES ============
interface Player {
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

interface QuestionType {
  id: string;
  nameAr: string;
  description: string;
}

// ============ COMPONENT ============
const LocalGamePage: React.FC = () => {
  const navigate = useNavigate();

  // Game data
  const [players, setPlayers] = useState<Player[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [round, setRound] = useState(1);
  const [pickerIndex, setPickerIndex] = useState(0); // Which player picks (rotates for subject/type)
  const [pickPhase, setPickPhase] = useState<'subject' | 'type'>('subject'); // What they're picking

  // Current round state
  const [phase, setPhase] = useState<'pick_subject' | 'pick_type' | 'answering' | 'results'>('pick_subject');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [playerAnswers, setPlayerAnswers] = useState<Record<string, string>>({});
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
      setPlayers(parsed.players || []);
      setQuestionTypes(HARDCODED_QUESTION_TYPES);
      loadSubjects();
    } catch {
      navigate('/');
    }
  }, [navigate]);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      const data = Array.isArray(res.data) ? res.data : (res.data?.subjects || []);
      const mapped = data.map((s: any) => ({
        id: s._id || s.id,
        nameAr: s.nameAr || s.name || 'موضوع',
      }));
      setSubjects(mapped.length > 0 ? mapped : [
        { id: '1', nameAr: 'ثقافة عامة' },
      ]);
    } catch (err) {
      console.error('Error loading subjects:', err);
      // Use fallback subject
      setSubjects([{ id: '1', nameAr: 'ثقافة عامة' }]);
    }
  };

  const showResults = useCallback(() => {
    setPhase('results');
  }, []);

  // ============ TIMER ============
  useEffect(() => {
    if (phase !== 'answering' || timer <= 0) return;
    
    let intervalId: ReturnType<typeof setInterval>;
    let mounted = true;
    
    intervalId = setInterval(() => {
      if (!mounted) return;
      
      setTimer(t => {
        if (t <= 1) {
          if (mounted) {
            showResults();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [phase, showResults]);

  // ============ GAME LOGIC ============
  // Determine which player picks what - rotates through players
  const currentPicker = players[pickerIndex];

  const loadQuestion = async (subjectId: string, typeId: string) => {
    setLoading(true);
    try {
      const res = await api.post('/games/temp/question', { subjectId, questionTypeId: typeId });
      const q = res.data;
      
      // Check if response has error
      if (res.data.error) {
        throw new Error(res.data.message || res.data.error);
      }
      
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
      } else if (q.orderItems) {
        // For order questions, create options from order items
        const shuffled = shuffleArray([...q.orderItems]);
        options = shuffled.map((item: any, i: number) => ({
          id: item.id || `${i}`,
          text: item.text,
          isCorrect: false, // Will be checked based on position
        }));
      } else if (q.whoAndWhoData) {
        // For who-and-who questions, create options from achievements
        const shuffled = shuffleArray([...q.whoAndWhoData.achievements]);
        options = shuffled.map((ach: any, i: number) => ({
          id: ach.id || `${i}`,
          text: ach.text,
          isCorrect: false, // Will be checked based on personId matching
        }));
      }

      if (options.length === 0) {
        throw new Error('No options available for this question type');
      }

      setCurrentQuestion({
        id: q._id || q.id || Date.now().toString(),
        text: q.text,
        options,
        points: q.points || 10,
        timeLimit: q.timeLimit || 30,
      });
      setPlayerAnswers({});
      setTimer(q.timeLimit || 30);
      setPhase('answering');
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading question:', err);
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ في تحميل السؤال';
      
      // Show error to user
      alert(errorMessage + '\n\nسيتم استخدام سؤال احتياطي.');
      
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
      setPlayerAnswers({});
      setTimer(30);
      setPhase('answering');
      setLoading(false);
    }
  };

  const selectSubject = (subjectId: string) => {
    if (phase !== 'pick_subject') return;
    setSelectedSubject(subjectId);
    // Move to next player to pick type
    const nextPickerIndex = (pickerIndex + 1) % players.length;
    setPickerIndex(nextPickerIndex);
    setPickPhase('type');
    setPhase('pick_type');
  };

  const selectType = async (typeId: string) => {
    if (phase !== 'pick_type') return;
    setSelectedType(typeId);
    
    // Now we have both subject and type - load question
    if (!selectedSubject) {
      console.warn('Subject not selected yet');
      return;
    }
    
    await loadQuestion(selectedSubject, typeId);
  };

  const answerQuestion = (playerId: string, optionId: string) => {
    if (playerAnswers[playerId] || phase !== 'answering') return; // Already answered or wrong phase
    setPlayerAnswers(prev => ({ ...prev, [playerId]: optionId }));
  };

  const nextRound = () => {
    if (!currentQuestion || phase !== 'results') return; // Only allow in results phase

    // Calculate scores - each player gets points if correct
    const correctId = currentQuestion.options?.find(o => o.isCorrect)?.id;
    if (correctId) {
      setPlayers(prev => prev.map(player => {
        const answered = playerAnswers[player.id];
        const correct = answered === correctId;
        return { ...player, score: player.score + (correct ? currentQuestion.points : 0) };
      }));
    }

    // Next round - rotate to next player for subject picking
    const nextPickerIndex = (pickerIndex + 1) % players.length;
    setPickerIndex(nextPickerIndex);
    setPickPhase('subject');
    if (nextPickerIndex === 0) setRound(r => r + 1);
    
    setCurrentQuestion(null);
    setPlayerAnswers({});
    setSelectedSubject(null);
    setSelectedType(null);
    setPhase('pick_subject'); // Always start new round with picking subject
  };

  const allAnswered = players.length > 0 && players.every(p => playerAnswers[p.id]);

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
  if (players.length === 0) {
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
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {players.map((player, i) => {
              const isPicking = i === pickerIndex && (phase === 'pick_subject' || phase === 'pick_type');
              return (
                <div
                  key={player.id}
                  className={`rounded-xl px-6 py-4 text-center min-w-[140px] ${
                    isPicking ? 'ring-4 ring-yellow-400 scale-105' : ''
                  }`}
                  style={{ backgroundColor: player.color }}
                >
                  <div className="text-white font-bold">{player.name}</div>
                  <div className="text-4xl font-bold text-white">{player.score}</div>
                </div>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            
            {/* PICK SUBJECT */}
            {phase === 'pick_subject' && (
              <>
                <div className="text-center mb-6">
                  <span className="text-white text-xl">
                    <strong style={{ color: currentPicker?.color }}>{currentPicker?.name}</strong> يختار الموضوع
                  </span>
                </div>
                
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
              </>
            )}

            {/* PICK TYPE */}
            {phase === 'pick_type' && (
              <>
                <div className="text-center mb-6">
                  <span className="text-white text-xl">
                    <strong style={{ color: currentPicker?.color }}>{currentPicker?.name}</strong> يختار نوع السؤال
                  </span>
                  {selectedSubject && (
                    <p className="text-white/60 text-sm mt-2">
                      الموضوع: {subjects.find(s => s.id === selectedSubject)?.nameAr}
                    </p>
                  )}
                </div>
                
                {loading ? (
                  <p className="text-center text-white">جاري التحميل...</p>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4">
                    {questionTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => selectType(type.id)}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-6 py-4 text-lg font-bold transition-transform hover:scale-105 min-w-[160px]"
                      >
                        <div>{type.nameAr}</div>
                        <div className="text-sm text-white/70">{type.description}</div>
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

                {/* Each Player Answers */}
                {players.map(player => (
                  <div key={player.id} className="mb-6">
                    <div
                      className="text-center py-2 rounded-lg mb-3"
                      style={{ backgroundColor: `${player.color}60` }}
                    >
                      <span className="text-white font-bold">{player.name}</span>
                      {playerAnswers[player.id] && <span className="text-green-300 mr-2"> ✓</span>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestion.options.map(opt => {
                        const selected = playerAnswers[player.id] === opt.id;
                        const answered = !!playerAnswers[player.id];
                        return (
                          <button
                            key={opt.id}
                            onClick={() => answerQuestion(player.id, opt.id)}
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

                {/* Player Results */}
                {players.map(player => {
                  const answer = playerAnswers[player.id];
                  const selected = currentQuestion.options.find(o => o.id === answer);
                  const correct = selected?.isCorrect;
                  return (
                    <div
                      key={player.id}
                      className={`mb-3 p-4 rounded-xl ${correct ? 'bg-green-600/30' : 'bg-red-600/30'}`}
                    >
                      <div className="flex justify-between">
                        <span className="text-white font-bold">{player.name}</span>
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
