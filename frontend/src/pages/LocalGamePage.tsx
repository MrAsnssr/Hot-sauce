import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Shared/Button';
import { WoodyBackground } from '../components/Shared/WoodyBackground';
import api from '../utils/api';

// ============ TYPES ============
interface Player {
  id: string;
  name: string;
  teamId: string;
}

interface Team {
  id: string;
  name: string;
  color: string;
  players: Player[];
  score: number;
}

interface GameConfig {
  mode: string;
  players: Player[];
  teams: Team[];
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface GameQuestion {
  id: string;
  text: string;
  options: QuestionOption[];
  correctAnswer?: string;
  points: number;
  timeLimit: number;
}

interface Subject {
  id: string;
  _id?: string;
  name: string;
  nameAr: string;
}

interface QuestionType {
  id: string;
  name: string;
  nameAr: string;
  description: string;
}

type GamePhase = 
  | 'select_subject'
  | 'select_type'
  | 'answering'
  | 'results'
  | 'game_over';

// ============ HARDCODED QUESTION TYPES ============
const QUESTION_TYPES: QuestionType[] = [
  { id: 'four-options', name: 'Multiple Choice', nameAr: 'اختيار من متعدد', description: '4 خيارات' },
  { id: 'fill-blank', name: 'Fill Blank', nameAr: 'املأ الفراغ', description: 'أكمل الجملة' },
];

// ============ COMPONENT ============
const LocalGamePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Game state
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('select_subject');
  
  // Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  
  // Answers
  const [teamAnswers, setTeamAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============ INITIALIZATION ============
  useEffect(() => {
    const config = sessionStorage.getItem('gameConfig');
    if (!config) {
      navigate('/');
      return;
    }
    
    try {
      const parsed = JSON.parse(config) as GameConfig;
      // Initialize teams with score 0
      const teamsWithScore = parsed.teams.map(t => ({ ...t, score: 0 }));
      setTeams(teamsWithScore);
      loadSubjects();
    } catch (e) {
      console.error('Error parsing game config:', e);
      navigate('/');
    }
  }, [navigate]);

  const loadSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      const data = response.data;
      // Map _id to id
      const mapped = Array.isArray(data) ? data.map((s: any) => ({
        id: s._id || s.id,
        _id: s._id,
        name: s.name,
        nameAr: s.nameAr || s.name,
      })) : [];
      setSubjects(mapped);
    } catch (e) {
      console.error('Error loading subjects:', e);
      // Fallback subjects
      setSubjects([
        { id: 'fallback-1', name: 'General', nameAr: 'عام' },
      ]);
    }
  };

  // ============ TIMER ============
  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  // Auto-advance when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && phase === 'answering') {
      handleShowResults();
    }
  }, [timeRemaining, phase]);

  // ============ GAME LOGIC ============
  const currentTeam = teams[currentTeamIndex] || null;
  const opposingTeam = teams[(currentTeamIndex + 1) % Math.max(teams.length, 1)] || null;

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setPhase('select_type');
  };

  const handleSelectType = async (type: QuestionType) => {
    setSelectedType(type);
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/games/temp/question', {
        subjectId: selectedSubject?.id || selectedSubject?._id,
        questionTypeId: type.id,
      });
      
      const q = response.data;
      
      // Build question with proper structure
      let options: QuestionOption[] = [];
      
      if (q.options && Array.isArray(q.options) && q.options.length > 0) {
        // Has options - use them
        options = q.options.map((opt: any, idx: number) => ({
          id: opt.id || opt._id || `opt-${idx}`,
          text: opt.text,
          isCorrect: opt.isCorrect === true,
        }));
      } else if (q.correctAnswer) {
        // Fill-blank - create options from correct answer
        options = [
          { id: 'correct', text: q.correctAnswer, isCorrect: true },
          { id: 'wrong1', text: 'إجابة خاطئة 1', isCorrect: false },
          { id: 'wrong2', text: 'إجابة خاطئة 2', isCorrect: false },
          { id: 'wrong3', text: 'إجابة خاطئة 3', isCorrect: false },
        ].sort(() => Math.random() - 0.5);
      } else {
        throw new Error('Question has no options or correct answer');
      }
      
      const gameQuestion: GameQuestion = {
        id: q._id || q.id || `q-${Date.now()}`,
        text: q.text,
        options,
        correctAnswer: q.correctAnswer,
        points: q.points || 10,
        timeLimit: q.timeLimit || 30,
      };
      
      setCurrentQuestion(gameQuestion);
      setTeamAnswers({});
      setTimeRemaining(gameQuestion.timeLimit);
      setTimerActive(true);
      setPhase('answering');
      
    } catch (e: any) {
      console.error('Error loading question:', e);
      if (e.response?.status === 404) {
        setError('لا توجد أسئلة لهذا الموضوع. جرب موضوع آخر.');
      } else {
        setError('حدث خطأ في تحميل السؤال');
      }
      setPhase('select_subject');
      setSelectedSubject(null);
      setSelectedType(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamAnswer = (teamId: string, answerId: string) => {
    if (teamAnswers[teamId]) return; // Already answered
    
    setTeamAnswers(prev => ({
      ...prev,
      [teamId]: answerId,
    }));
  };

  const handleShowResults = useCallback(() => {
    setTimerActive(false);
    setPhase('results');
  }, []);

  const handleNextRound = () => {
    if (!currentQuestion) return;
    
    // Calculate scores
    const correctOptionId = currentQuestion.options.find(o => o.isCorrect)?.id;
    
    setTeams(prevTeams => {
      return prevTeams.map(team => {
        const teamAnswer = teamAnswers[team.id];
        const isCorrect = teamAnswer === correctOptionId;
        const pointsEarned = isCorrect ? currentQuestion.points : 0;
        return { ...team, score: team.score + pointsEarned };
      });
    });
    
    // Reset for next round
    setSelectedSubject(null);
    setSelectedType(null);
    setCurrentQuestion(null);
    setTeamAnswers({});
    setError(null);
    
    // Alternate teams
    const nextIndex = (currentTeamIndex + 1) % teams.length;
    setCurrentTeamIndex(nextIndex);
    if (nextIndex === 0) {
      setRound(r => r + 1);
    }
    
    setPhase('select_subject');
  };

  // ============ RENDER HELPERS ============
  const allTeamsAnswered = teams.every(t => teamAnswers[t.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============ LOADING STATE ============
  if (teams.length === 0) {
    return (
      <WoodyBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-2xl">جاري التحميل...</div>
        </div>
      </WoodyBackground>
    );
  }

  // ============ RENDER ============
  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من إنهاء اللعبة؟')) {
                  sessionStorage.removeItem('gameConfig');
                  navigate('/');
                }
              }}
              className="text-white/60 hover:text-white px-4 py-2"
            >
              ✕ إنهاء
            </button>
            <div className="text-white text-xl font-bold">الجولة {round}</div>
            <div className="w-20" />
          </div>

          {/* Score Board */}
          <div className="flex gap-4 justify-center mb-8">
            {teams.map((team, idx) => (
              <div
                key={team.id}
                className={`rounded-xl p-4 min-w-[140px] text-center transition-all ${
                  idx === currentTeamIndex && phase === 'select_subject'
                    ? 'scale-110 ring-4 ring-yellow-400'
                    : ''
                }`}
                style={{ backgroundColor: team.color || '#3b82f6' }}
              >
                <h3 className="text-white font-bold mb-1">{team.name}</h3>
                <div className="text-4xl font-bold text-white">{team.score}</div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-center">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            
            {/* PHASE: Select Subject */}
            {phase === 'select_subject' && (
              <>
                <div 
                  className="text-center mb-6 py-3 rounded-lg"
                  style={{ backgroundColor: `${currentTeam?.color}50` }}
                >
                  <span className="text-white text-xl">
                    دور <strong>{currentTeam?.name}</strong> - اختر الموضوع
                  </span>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                  {subjects.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => handleSelectSubject(subject)}
                      className="bg-white/20 hover:bg-white/30 text-white rounded-xl p-4 min-w-[140px] transition-all hover:scale-105"
                    >
                      <div className="text-lg font-bold">{subject.nameAr}</div>
                    </button>
                  ))}
                </div>
                
                {subjects.length === 0 && (
                  <p className="text-center text-white/60">جاري تحميل المواضيع...</p>
                )}
              </>
            )}

            {/* PHASE: Select Type */}
            {phase === 'select_type' && (
              <>
                <div 
                  className="text-center mb-6 py-3 rounded-lg"
                  style={{ backgroundColor: `${opposingTeam?.color}50` }}
                >
                  <span className="text-white text-xl">
                    دور <strong>{opposingTeam?.name}</strong> - اختر نوع السؤال
                  </span>
                </div>
                
                <p className="text-center text-white/60 mb-4">
                  الموضوع: {selectedSubject?.nameAr}
                </p>
                
                {loading ? (
                  <p className="text-center text-white">جاري تحميل السؤال...</p>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4">
                    {QUESTION_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => handleSelectType(type)}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-xl p-4 min-w-[160px] transition-all hover:scale-105"
                      >
                        <div className="text-lg font-bold">{type.nameAr}</div>
                        <div className="text-sm text-white/70">{type.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* PHASE: Answering */}
            {phase === 'answering' && currentQuestion && (
              <>
                {/* Timer */}
                <div className="flex justify-end mb-4">
                  <div className={`text-3xl font-bold ${timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {formatTime(timeRemaining)}
                  </div>
                </div>
                
                {/* Question */}
                <h2 className="text-2xl font-bold text-white text-center mb-8">
                  {currentQuestion.text}
                </h2>
                
                {/* Each Team's Answer Section */}
                {teams.map(team => (
                  <div key={team.id} className="mb-8">
                    <div 
                      className="text-center mb-3 py-2 rounded-lg"
                      style={{ backgroundColor: `${team.color}40` }}
                    >
                      <span className="text-white font-bold">{team.name}</span>
                      {teamAnswers[team.id] && (
                        <span className="text-green-400 mr-2"> ✓ أجاب</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestion.options.map(option => {
                        const isSelected = teamAnswers[team.id] === option.id;
                        const isAnswered = !!teamAnswers[team.id];
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleTeamAnswer(team.id, option.id)}
                            disabled={isAnswered}
                            className={`p-4 rounded-xl text-white text-lg transition-all ${
                              isSelected
                                ? 'bg-blue-600 ring-4 ring-blue-400'
                                : isAnswered
                                ? 'bg-white/10 cursor-not-allowed opacity-50'
                                : 'bg-white/20 hover:bg-white/30'
                            }`}
                          >
                            {option.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Show Results Button */}
                {allTeamsAnswered && (
                  <div className="text-center mt-6">
                    <Button onClick={handleShowResults} variant="primary" size="lg">
                      كشف الإجابة
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* PHASE: Results */}
            {phase === 'results' && currentQuestion && (
              <>
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                  {currentQuestion.text}
                </h2>
                
                {/* Correct Answer */}
                <div className="bg-green-600/30 border-2 border-green-500 rounded-xl p-4 mb-6 text-center">
                  <p className="text-green-400 text-sm mb-1">الإجابة الصحيحة:</p>
                  <p className="text-white text-xl font-bold">
                    {currentQuestion.options.find(o => o.isCorrect)?.text}
                  </p>
                </div>
                
                {/* Each Team's Result */}
                {teams.map(team => {
                  const teamAnswer = teamAnswers[team.id];
                  const selectedOption = currentQuestion.options.find(o => o.id === teamAnswer);
                  const isCorrect = selectedOption?.isCorrect === true;
                  
                  return (
                    <div 
                      key={team.id} 
                      className={`mb-4 p-4 rounded-xl ${
                        isCorrect ? 'bg-green-600/30' : 'bg-red-600/30'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold">{team.name}</span>
                        <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                          {!teamAnswer ? 'لم يجب ❌' : isCorrect ? 'صحيح! ✓ +' + currentQuestion.points : 'خطأ ❌'}
                        </span>
                      </div>
                      {teamAnswer && (
                        <p className="text-white/70 text-sm mt-1">
                          الإجابة: {selectedOption?.text || 'غير معروف'}
                        </p>
                      )}
                    </div>
                  );
                })}
                
                {/* Next Round Button */}
                <div className="text-center mt-8">
                  <Button onClick={handleNextRound} variant="primary" size="lg">
                    الجولة التالية ←
                  </Button>
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
