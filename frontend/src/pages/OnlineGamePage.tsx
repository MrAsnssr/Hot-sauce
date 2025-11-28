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
  roomCode: string;
  teams: Team[];
  settings: {
    extraSauceEnabled: boolean;
    selectedSubjects: string[];
    selectedTypes: string[];
  };
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
  points: number;
  timeLimit: number;
}

type GamePhase = 'question' | 'results';

// ============ COMPONENT ============
const OnlineGamePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Game state
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('question');
  
  // Question state
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  
  // Loading
  const [loading, setLoading] = useState(true);

  // ============ INITIALIZATION ============
  useEffect(() => {
    const config = sessionStorage.getItem('gameConfig');
    if (!config) {
      navigate('/');
      return;
    }
    
    try {
      const parsed = JSON.parse(config) as GameConfig;
      setGameConfig(parsed);
      // Initialize teams with score 0 if needed
      const teamsWithScore = parsed.teams.map(t => ({ 
        ...t, 
        score: t.score || 0 
      }));
      setTeams(teamsWithScore);
      loadNextQuestion();
    } catch (e) {
      console.error('Error parsing game config:', e);
      navigate('/');
    }
  }, [navigate]);

  // ============ LOAD QUESTION ============
  const loadNextQuestion = async () => {
    setLoading(true);
    
    try {
      const response = await api.post('/games/temp/question', {});
      const q = response.data;
      
      // Build question
      let options: QuestionOption[] = [];
      
      if (q.options && Array.isArray(q.options) && q.options.length > 0) {
        options = q.options.map((opt: any, idx: number) => ({
          id: opt.id || opt._id || `opt-${idx}`,
          text: opt.text,
          isCorrect: opt.isCorrect === true,
        }));
      } else if (q.correctAnswer) {
        options = [
          { id: 'correct', text: q.correctAnswer, isCorrect: true },
          { id: 'wrong1', text: 'إجابة خاطئة 1', isCorrect: false },
          { id: 'wrong2', text: 'إجابة خاطئة 2', isCorrect: false },
          { id: 'wrong3', text: 'إجابة خاطئة 3', isCorrect: false },
        ].sort(() => Math.random() - 0.5);
      }
      
      const gameQuestion: GameQuestion = {
        id: q._id || q.id || `q-${Date.now()}`,
        text: q.text,
        options,
        points: q.points || 10,
        timeLimit: q.timeLimit || 30,
      };
      
      setCurrentQuestion(gameQuestion);
      setSelectedAnswer(null);
      setTimeRemaining(gameQuestion.timeLimit);
      setTimerActive(true);
      setPhase('question');
      
    } catch (e) {
      console.error('Error loading question:', e);
      // Use mock question
      setCurrentQuestion({
        id: `mock-${Date.now()}`,
        text: 'ما هي عاصمة فرنسا؟',
        options: [
          { id: '1', text: 'باريس', isCorrect: true },
          { id: '2', text: 'لندن', isCorrect: false },
          { id: '3', text: 'برلين', isCorrect: false },
          { id: '4', text: 'مدريد', isCorrect: false },
        ],
        points: 10,
        timeLimit: 30,
      });
      setTimeRemaining(30);
      setTimerActive(true);
      setPhase('question');
    } finally {
      setLoading(false);
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

  // Auto-show results when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && phase === 'question') {
      handleShowResults();
    }
  }, [timeRemaining, phase]);

  // ============ GAME LOGIC ============
  const currentTeam = teams[currentTeamIndex] || null;

  const handleAnswer = (answerId: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answerId);
  };

  const handleShowResults = useCallback(() => {
    setTimerActive(false);
    setPhase('results');
  }, []);

  const handleNextRound = () => {
    if (!currentQuestion) return;
    
    // Calculate score
    const correctOption = currentQuestion.options.find(o => o.isCorrect);
    const isCorrect = selectedAnswer === correctOption?.id;
    
    if (isCorrect && currentTeam) {
      setTeams(prevTeams => 
        prevTeams.map(t => 
          t.id === currentTeam.id 
            ? { ...t, score: t.score + currentQuestion.points }
            : t
        )
      );
    }
    
    // Next team/round
    const nextIndex = (currentTeamIndex + 1) % Math.max(teams.length, 1);
    setCurrentTeamIndex(nextIndex);
    if (nextIndex === 0) {
      setRound(r => r + 1);
    }
    
    setSelectedAnswer(null);
    loadNextQuestion();
  };

  // ============ RENDER HELPERS ============
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============ LOADING STATE ============
  if (!gameConfig || teams.length === 0) {
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
            <div className="text-white">
              <span className="text-yellow-400 font-bold">{gameConfig.roomCode}</span>
              <span className="text-white/60 mr-4"> | الجولة {round}</span>
            </div>
            <div className="w-20" />
          </div>

          {/* Score Board */}
          <div className="flex gap-4 justify-center mb-8">
            {teams.map((team, idx) => (
              <div
                key={team.id}
                className={`rounded-xl p-4 min-w-[140px] text-center transition-all ${
                  idx === currentTeamIndex ? 'scale-110 ring-4 ring-yellow-400' : ''
                }`}
                style={{ backgroundColor: team.color || '#3b82f6' }}
              >
                <h3 className="text-white font-bold mb-1">{team.name}</h3>
                <div className="text-4xl font-bold text-white">{team.score}</div>
                <div className="text-white/60 text-xs mt-1">
                  {team.players?.length || 0} لاعب
                </div>
              </div>
            ))}
          </div>

          {/* Current Team */}
          {currentTeam && (
            <div 
              className="text-center mb-6 py-3 rounded-lg"
              style={{ backgroundColor: `${currentTeam.color}50` }}
            >
              <span className="text-white text-xl">
                دور: <strong>{currentTeam.name}</strong>
              </span>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            
            {loading ? (
              <div className="text-center py-12">
                <div className="text-white text-xl">جاري تحميل السؤال...</div>
              </div>
            ) : phase === 'question' && currentQuestion ? (
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
                
                {/* Options */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {currentQuestion.options.map(option => {
                    const isSelected = selectedAnswer === option.id;
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer(option.id)}
                        disabled={!!selectedAnswer}
                        className={`p-4 rounded-xl text-white text-lg transition-all ${
                          isSelected
                            ? 'bg-blue-600 ring-4 ring-blue-400'
                            : selectedAnswer
                            ? 'bg-white/10 cursor-not-allowed opacity-50'
                            : 'bg-white/20 hover:bg-white/30'
                        }`}
                      >
                        {option.text}
                      </button>
                    );
                  })}
                </div>
                
                {/* Show Results Button */}
                {selectedAnswer && (
                  <div className="text-center">
                    <Button onClick={handleShowResults} variant="primary" size="lg">
                      كشف الإجابة
                    </Button>
                  </div>
                )}
              </>
            ) : phase === 'results' && currentQuestion ? (
              <>
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                  {currentQuestion.text}
                </h2>
                
                {/* Options with Results */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {currentQuestion.options.map(option => {
                    const isCorrect = option.isCorrect;
                    const wasSelected = selectedAnswer === option.id;
                    
                    return (
                      <div
                        key={option.id}
                        className={`p-4 rounded-xl text-white text-lg text-center ${
                          isCorrect
                            ? 'bg-green-600'
                            : wasSelected
                            ? 'bg-red-600'
                            : 'bg-white/20'
                        }`}
                      >
                        {option.text}
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
                  <Button onClick={handleNextRound} variant="primary" size="lg">
                    السؤال التالي ←
                  </Button>
                </div>
              </>
            ) : null}
            
          </div>
        </div>
      </div>
    </WoodyBackground>
  );
};

export default OnlineGamePage;

