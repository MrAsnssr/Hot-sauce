import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Shared/Button';
import { Timer } from '../components/Shared/Timer';
import { Question } from '../types/question.types';
import { Power } from '../types/power.types';
import { PowerRegistry } from '../types/power.registry';
import { WoodyBackground } from '../components/Shared/WoodyBackground';
import api from '../utils/api';

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

type GamePhase = 
  | 'waiting'
  | 'show_question'
  | 'show_answer'
  | 'round_result'
  | 'game_over';

const OnlineGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isHost] = useState(() => sessionStorage.getItem('isHost') === 'true');
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('waiting');
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const [currentSauce, setCurrentSauce] = useState<Power | null>(null);

  useEffect(() => {
    const config = sessionStorage.getItem('gameConfig');
    if (!config) {
      navigate('/');
      return;
    }
    const parsed = JSON.parse(config) as GameConfig;
    setGameConfig(parsed);
    setTeams(parsed.teams);
    
    if (isHost) {
      // Host starts the game
      loadNextQuestion();
    }
  }, [navigate, isHost]);

  const currentTeam = teams[currentTeamIndex];

  const loadNextQuestion = async () => {
    try {
      const response = await api.post('/games/temp/question', {});
      setCurrentQuestion(response.data);
    } catch (error) {
      // Mock question
      setCurrentQuestion({
        id: `q-${Date.now()}`,
        text: 'ما هي أكبر دولة في العالم من حيث المساحة؟',
        subjectId: '1',
        questionTypeId: '1',
        options: [
          { id: '1', text: 'روسيا', isCorrect: true },
          { id: '2', text: 'كندا', isCorrect: false },
          { id: '3', text: 'الصين', isCorrect: false },
          { id: '4', text: 'أمريكا', isCorrect: false },
        ],
        difficulty: 'medium',
        points: 10,
        timeLimit: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Random sauce if enabled
    if (gameConfig?.settings.extraSauceEnabled) {
      const allPowers = [...PowerRegistry.getPositive(), ...PowerRegistry.getNegative()];
      const randomSauce = allPowers[Math.floor(Math.random() * allPowers.length)];
      setCurrentSauce(Math.random() > 0.5 ? randomSauce : null);
    }

    setPhase('show_question');
    setSelectedAnswer(null);
    setTimeUp(false);
  };

  const handleAnswer = (answerId: string) => {
    if (selectedAnswer || timeUp) return;
    setSelectedAnswer(answerId);
    
    // In online mode, send answer to server
    // TODO: socket.emit('answer', { answerId })
  };

  const handleTimeUp = () => {
    if (!selectedAnswer) {
      setTimeUp(true);
    }
  };

  const showAnswer = () => {
    setPhase('show_answer');
  };

  const handleNextRound = () => {
    if (!currentQuestion) return;

    // Calculate score
    let isCorrect = false;
    if (selectedAnswer && currentQuestion.options) {
      const selected = currentQuestion.options.find((o) => o.id === selectedAnswer);
      isCorrect = selected?.isCorrect || false;
    }

    if (isCorrect) {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === currentTeam?.id
            ? { ...t, score: t.score + (currentQuestion.points || 10) }
            : t
        )
      );
    }

    // Move to next team/round
    const nextTeamIndex = (currentTeamIndex + 1) % teams.length;
    if (nextTeamIndex === 0) {
      setRound((r) => r + 1);
    }
    setCurrentTeamIndex(nextTeamIndex);

    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setCurrentSauce(null);
    setTimeUp(false);
    
    loadNextQuestion();
  };

  if (!gameConfig || teams.length === 0) {
    return (
      <WoodyBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-2xl">جاري التحميل...</div>
        </div>
      </WoodyBackground>
    );
  }

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من إنهاء اللعبة؟')) {
                navigate('/');
              }
            }}
            className="text-white/60 hover:text-white"
          >
            إنهاء
          </button>
          <div className="text-white">
            <span className="text-white/60">الغرفة: </span>
            <span className="text-yellow-400 font-bold">{gameConfig.roomCode}</span>
            <span className="text-white/60 mr-4"> | الجولة {round}</span>
          </div>
          <div className="w-16" />
        </div>

        {/* Score Board */}
        <div className="flex gap-4 justify-center mb-8">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className={`rounded-xl p-4 min-w-[150px] text-center transition-all ${
                idx === currentTeamIndex ? 'scale-110 ring-4 ring-white/50' : 'opacity-70'
              }`}
              style={{ backgroundColor: `${team.color}80` }}
            >
              <h3 className="text-white font-bold mb-1">{team.name}</h3>
              <div className="text-4xl font-bold text-white">{team.score}</div>
              <div className="text-white/60 text-xs mt-1">
                {team.players.length} لاعب
              </div>
            </div>
          ))}
        </div>

        {/* Current Team Turn */}
        {currentTeam && (
          <div
            className="text-center mb-6 py-3 rounded-xl"
            style={{ backgroundColor: `${currentTeam.color}40` }}
          >
            <span className="text-white text-xl">
              دور: <strong>{currentTeam.name}</strong>
            </span>
          </div>
        )}

        {/* Game Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          {phase === 'show_question' && currentQuestion && (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  {currentSauce && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        currentSauce.isPositive ? 'bg-green-600' : 'bg-red-600'
                      } text-white`}
                    >
                      🌶️ {currentSauce.nameAr}
                    </span>
                  )}
                </div>
                <Timer
                  initialTime={currentQuestion.timeLimit || 30}
                  onTimeUp={handleTimeUp}
                  paused={!!selectedAnswer}
                />
              </div>

              <h2 className="text-2xl font-bold text-white text-center mb-8">
                {currentQuestion.text}
              </h2>

              {currentQuestion.options && (
                <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto mb-6">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      disabled={!!selectedAnswer || timeUp}
                      className={`p-4 rounded-xl text-white text-lg transition-all min-w-[200px] flex-1 max-w-[280px] ${
                        selectedAnswer === option.id
                          ? 'bg-blue-600 ring-4 ring-blue-400'
                          : 'bg-white/20 hover:bg-white/30'
                      } ${(selectedAnswer || timeUp) ? 'cursor-not-allowed' : ''}`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              )}

              {isHost && (
                <div className="text-center">
                  <Button onClick={showAnswer} variant="primary" size="lg">
                    كشف الإجابة
                  </Button>
                </div>
              )}
            </>
          )}

          {phase === 'show_answer' && currentQuestion && (
            <>
              <h2 className="text-2xl font-bold text-white text-center mb-4">
                {currentQuestion.text}
              </h2>

              {currentQuestion.options && (
                <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto mb-6">
                  {currentQuestion.options.map((option) => {
                    const isCorrect = option.isCorrect;
                    const wasSelected = selectedAnswer === option.id;
                    return (
                      <div
                        key={option.id}
                        className={`p-4 rounded-xl text-white text-lg min-w-[200px] flex-1 max-w-[280px] text-center ${
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
              )}

              <div className="text-center">
                <div className="text-2xl mb-4">
                  {selectedAnswer &&
                  currentQuestion.options?.find((o) => o.id === selectedAnswer)
                    ?.isCorrect ? (
                    <span className="text-green-400">إجابة صحيحة! 🎉</span>
                  ) : (
                    <span className="text-red-400">
                      {timeUp ? 'انتهى الوقت! ⏰' : 'إجابة خاطئة 😢'}
                    </span>
                  )}
                </div>
                {isHost && (
                  <Button onClick={handleNextRound} variant="primary" size="lg">
                    السؤال التالي
                  </Button>
                )}
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

