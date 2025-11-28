import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Shared/Button';
import { Timer } from '../components/Shared/Timer';
import { WoodyBackground } from '../components/Shared/WoodyBackground';
import { Subject, QuestionType, Question } from '../types/question.types';
import { Power } from '../types/power.types';
import { PowerRegistry } from '../types/power.registry';
import { HARDCODED_QUESTION_TYPES } from '../constants/questionTypes';
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
  players: Player[];
  teams: Team[];
}

type GamePhase = 
  | 'team_select_subject'
  | 'opposing_team_select_type'
  | 'subject_team_select_sauce'
  | 'show_question'
  | 'both_teams_answer'
  | 'show_answer'
  | 'round_result'
  | 'game_over';

const LocalGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('team_select_subject');
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  
  // Safe array getters to prevent .map() errors
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const safeQuestionTypes = Array.isArray(questionTypes) ? questionTypes : [];
  const safeTeams = Array.isArray(teams) ? teams : [];
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [teamAAnswer, setTeamAAnswer] = useState<string | null>(null);
  const [teamBAnswer, setTeamBAnswer] = useState<string | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  
  const [extraSauceEnabled, setExtraSauceEnabled] = useState(true);
  const [currentSauce, setCurrentSauce] = useState<Power | null>(null);
  const [subjectTeamId, setSubjectTeamId] = useState<string | null>(null);

  useEffect(() => {
    const config = sessionStorage.getItem('gameConfig');
    if (!config) {
      navigate('/');
      return;
    }
    const parsed = JSON.parse(config) as GameConfig;
    parsed.teams = parsed.teams.map((t) => ({ ...t, score: 0 }));
    setGameConfig(parsed);
    setTeams(parsed.teams);
    
    // Fetch subjects and question types
    fetchGameData();
  }, [navigate]);

  const fetchGameData = async () => {
    // Question types are hardcoded
    setQuestionTypes(HARDCODED_QUESTION_TYPES);
    
    try {
      const subjectsRes = await api.get('/subjects');
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Use mock data if API fails
      setSubjects([
        { id: '1', name: 'History', nameAr: 'التاريخ', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Science', nameAr: 'العلوم', createdAt: new Date(), updatedAt: new Date() },
        { id: '3', name: 'Sports', nameAr: 'الرياضة', createdAt: new Date(), updatedAt: new Date() },
        { id: '4', name: 'Geography', nameAr: 'الجغرافيا', createdAt: new Date(), updatedAt: new Date() },
      ]);
    }
  };

  // Defensive checks for teams
  const currentTeam = teams.length > 0 ? teams[currentTeamIndex] : null;
  const opposingTeam = teams.length > 1 ? teams[(currentTeamIndex + 1) % teams.length] : null;
  const teamA = teams.length > 0 ? teams[0] : null;
  const teamB = teams.length > 1 ? teams[1] : null;

  const handleSubjectSelect = (subject: Subject) => {
    if (!currentTeam) return;
    setSelectedSubject(subject);
    setSubjectTeamId(currentTeam.id);
    // Switch to opposing team to pick type
    setPhase('opposing_team_select_type');
  };

  const handleTypeSelect = (type: QuestionType) => {
    setSelectedType(type);
    // Subject team (Team A) picks sauce
    if (extraSauceEnabled) {
      setPhase('subject_team_select_sauce');
    } else {
      loadQuestion();
    }
  };

  const handleSauceSelect = (sauce: Power | null) => {
    setCurrentSauce(sauce);
    loadQuestion();
  };

  const loadQuestion = async () => {
    try {
      // Try to get from API
      const response = await api.post('/games/temp/question', {
        subjectId: selectedSubject?.id,
        questionTypeId: selectedType?.id,
      });
      
      // Ensure the question has the correct structure
      const question = response.data;
      let formattedQuestion = question;
      if (!question.id && question._id) {
        // Convert _id to id for consistency
        formattedQuestion = { ...question, id: question._id.toString() };
      }
      
      setCurrentQuestion(formattedQuestion);
      setPhase('show_question');
      setTimeUp(false);
      setTeamAAnswer(null);
      setTeamBAnswer(null);
    } catch (error: any) {
      // Show error message if no questions found
      if (error.response?.status === 404) {
        alert('لا توجد أسئلة متاحة للموضوع ونوع السؤال المحدد. يرجى إنشاء أسئلة من لوحة الإدارة أولاً.');
        // Go back to subject selection
        setPhase('team_select_subject');
        setSelectedSubject(null);
        setSelectedType(null);
        return;
      }
      
      // For other errors, show generic message
      console.error('Error loading question:', error);
      alert('حدث خطأ في تحميل السؤال. يرجى المحاولة مرة أخرى.');
      setPhase('team_select_subject');
      setSelectedSubject(null);
      setSelectedType(null);
    }
  };

  const handleTeamAAnswer = (answerId: string) => {
    if (teamAAnswer || timeUp) return;
    setTeamAAnswer(answerId);
    checkBothAnswered();
  };

  const handleTeamBAnswer = (answerId: string) => {
    if (teamBAnswer || timeUp) return;
    setTeamBAnswer(answerId);
    checkBothAnswered();
  };

  const checkBothAnswered = () => {
    if (teamAAnswer && teamBAnswer) {
      setPhase('show_answer');
    }
  };

  const handleTimeUp = useCallback(() => {
    if (!timeUp) {
      setTimeUp(true);
      // Auto-show answer if time is up
      setTimeout(() => {
        setPhase('show_answer');
      }, 1000);
    }
  }, [timeUp]);

  const handleNextRound = () => {
    if (!currentQuestion) return;

    // Calculate scores for both teams
    const teamAScore = teams[0];
    const teamBScore = teams[1];
    
    if (!teamAScore || !teamBScore) {
      console.error('Teams not found');
      return;
    }
    
    let teamACorrect = false;
    let teamBCorrect = false;
    
    if (teamAAnswer && currentQuestion.options) {
      const selected = currentQuestion.options.find((o) => o.id === teamAAnswer);
      teamACorrect = selected?.isCorrect || false;
    }
    
    if (teamBAnswer && currentQuestion.options) {
      const selected = currentQuestion.options.find((o) => o.id === teamBAnswer);
      teamBCorrect = selected?.isCorrect || false;
    }

    // Apply sauce effects
    let teamAPoints = teamACorrect ? (currentQuestion.points || 10) : 0;
    let teamBPoints = teamBCorrect ? (currentQuestion.points || 10) : 0;

    if (currentSauce) {
      if (currentSauce.effect === 'double_points' && subjectTeamId === teamAScore.id && teamACorrect) {
        teamAPoints *= 2;
      } else if (currentSauce.effect === 'double_points' && subjectTeamId === teamBScore.id && teamBCorrect) {
        teamBPoints *= 2;
      }
      
      if (currentSauce.effect === 'steal_point' && subjectTeamId === teamAScore.id && teamACorrect) {
        teamAPoints += 1;
        teamBPoints = Math.max(0, teamBPoints - 1);
      } else if (currentSauce.effect === 'steal_point' && subjectTeamId === teamBScore.id && teamBCorrect) {
        teamBPoints += 1;
        teamAPoints = Math.max(0, teamAPoints - 1);
      }
    }

    // Update scores
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamAScore.id) {
          return { ...t, score: t.score + teamAPoints };
        } else if (t.id === teamBScore.id) {
          return { ...t, score: t.score + teamBPoints };
        }
        return t;
      })
    );

    // Move to next round - alternate who picks subject
    const nextTeamIndex = (currentTeamIndex + 1) % teams.length;
    if (nextTeamIndex === 0) {
      setRound((r) => r + 1);
    }
    setCurrentTeamIndex(nextTeamIndex);

    // Reset for next round
    setSelectedSubject(null);
    setSelectedType(null);
    setCurrentQuestion(null);
    setTeamAAnswer(null);
    setTeamBAnswer(null);
    setCurrentSauce(null);
    setSubjectTeamId(null);
    setTimeUp(false);
    setPhase('team_select_subject');
  };

  if (!gameConfig || teams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with scores */}
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
          <div className="text-white text-xl">الجولة {round}</div>
          <div className="w-16" />
        </div>

        {/* Score Board */}
        <div className="flex gap-4 justify-center mb-8">
          {safeTeams.map((team, idx) => (
            <div
              key={team.id}
              className={`rounded-xl p-4 min-w-[150px] text-center transition-all ${
                idx === currentTeamIndex ? 'scale-110 ring-4 ring-white/50' : 'opacity-70'
              }`}
              style={{ backgroundColor: `${team.color}80` }}
            >
              <h3 className="text-white font-bold mb-1">{team.name}</h3>
              <div className="text-4xl font-bold text-white">{team.score}</div>
            </div>
          ))}
        </div>

        {/* Current Team Turn */}
        {phase === 'team_select_subject' && currentTeam && (
          <div
            className="text-center mb-6 py-3 rounded-xl"
            style={{ backgroundColor: `${currentTeam.color}40` }}
          >
            <span className="text-white text-xl">
              دور: <strong>{currentTeam.name}</strong> - اختر الموضوع
            </span>
          </div>
        )}
        {phase === 'opposing_team_select_type' && opposingTeam && (
          <div
            className="text-center mb-6 py-3 rounded-xl"
            style={{ backgroundColor: `${opposingTeam.color}40` }}
          >
            <span className="text-white text-xl">
              دور: <strong>{opposingTeam.name}</strong> - اختر نوع السؤال
            </span>
          </div>
        )}
        {phase === 'subject_team_select_sauce' && subjectTeamId && (
          <div
            className="text-center mb-6 py-3 rounded-xl"
            style={{ backgroundColor: `${teams.find(t => t.id === subjectTeamId)?.color}40` }}
          >
            <span className="text-white text-xl">
              دور: <strong>{teams.find(t => t.id === subjectTeamId)?.name}</strong> - اختر الصلصة الإضافية
            </span>
          </div>
        )}
        {(phase === 'show_question' || phase === 'both_teams_answer') && (
          <div className="text-center mb-6 py-3 rounded-xl bg-white/10">
            <span className="text-white text-xl">
              جميع الفرق تجيب على السؤال
            </span>
          </div>
        )}

        {/* Phase Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          {phase === 'team_select_subject' && (
            <>
              <h2 className="text-2xl font-bold text-white text-center mb-6">
                اختر الموضوع
              </h2>
              <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                {safeSubjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject)}
                    className="bg-white/20 hover:bg-white/30 text-white rounded-xl p-4 transition-all hover:scale-105 min-w-[140px]"
                  >
                    <div className="text-lg font-bold">{subject.nameAr}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === 'opposing_team_select_type' && (
            <>
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                اختر نوع السؤال
              </h2>
              <p className="text-white/60 text-center mb-6">
                الموضوع: {selectedSubject?.nameAr}
              </p>
              <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                {safeQuestionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type)}
                    className="bg-white/20 hover:bg-white/30 text-white rounded-xl p-4 transition-all hover:scale-105 min-w-[160px]"
                  >
                    <div className="text-lg font-bold">{type.nameAr}</div>
                    <div className="text-sm text-white/70">{type.description}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === 'subject_team_select_sauce' && (
            <>
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                🌶️ الصلصة الإضافية
              </h2>
              <p className="text-white/60 text-center mb-4">
                الصلصة تؤثر على جميع الفرق
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-green-400 font-bold mb-3 text-center">قوى خارقة ⚡</h3>
                  <div className="space-y-2">
                    {PowerRegistry.getPositive().slice(0, 4).map((power) => (
                      <button
                        key={power.id}
                        onClick={() => handleSauceSelect(power)}
                        className="w-full bg-green-600/50 hover:bg-green-600/70 text-white rounded-lg p-3 text-right transition-all"
                      >
                        <div className="font-bold">{power.nameAr}</div>
                        <div className="text-sm text-white/70">{power.descriptionAr}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-red-400 font-bold mb-3 text-center">صلصات سلبية 🔥</h3>
                  <div className="space-y-2">
                    {PowerRegistry.getNegative().slice(0, 4).map((power) => (
                      <button
                        key={power.id}
                        onClick={() => handleSauceSelect(power)}
                        className="w-full bg-red-600/50 hover:bg-red-600/70 text-white rounded-lg p-3 text-right transition-all"
                      >
                        <div className="font-bold">{power.nameAr}</div>
                        <div className="text-sm text-white/70">{power.descriptionAr}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Button onClick={() => handleSauceSelect(null)} variant="secondary">
                  تخطي الصلصة
                </Button>
              </div>
            </>
          )}

          {(phase === 'show_question' || phase === 'both_teams_answer') && currentQuestion && (
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
                  paused={!!(teamAAnswer && teamBAnswer)}
                />
              </div>

              <h2 className="text-2xl font-bold text-white text-center mb-8">
                {currentQuestion.text}
              </h2>

              {/* Team A Answer Section */}
              {teamA && (
              <div className="mb-6">
                <div className="text-center mb-3">
                  <span className="text-white font-bold" style={{ color: teamA.color }}>
                    {teamA.name}
                  </span>
                </div>
                {currentQuestion.options && (
                  <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleTeamAAnswer(option.id)}
                        disabled={!!teamAAnswer || timeUp}
                        className={`p-4 rounded-xl text-white text-lg transition-all min-w-[200px] flex-1 max-w-[280px] ${
                          teamAAnswer === option.id
                            ? 'bg-blue-600 ring-4 ring-blue-400'
                            : 'bg-white/20 hover:bg-white/30'
                        } ${(teamAAnswer || timeUp) ? 'cursor-not-allowed' : ''}`}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              )}

              {/* Team B Answer Section */}
              {teamB && (
              <div className="mb-6">
                <div className="text-center mb-3">
                  <span className="text-white font-bold" style={{ color: teamB.color }}>
                    {teamB.name}
                  </span>
                </div>
                {currentQuestion.options && (
                  <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleTeamBAnswer(option.id)}
                        disabled={!!teamBAnswer || timeUp}
                        className={`p-4 rounded-xl text-white text-lg transition-all min-w-[200px] flex-1 max-w-[280px] ${
                          teamBAnswer === option.id
                            ? 'bg-blue-600 ring-4 ring-blue-400'
                            : 'bg-white/20 hover:bg-white/30'
                        } ${(teamBAnswer || timeUp) ? 'cursor-not-allowed' : ''}`}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              )}

              {(teamAAnswer && teamBAnswer) && (
                <div className="text-center">
                  <Button onClick={() => setPhase('show_answer')} variant="primary" size="lg">
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

              {/* Team A Results */}
              {teamA && (
              <div className="mb-6">
                <div className="text-center mb-3">
                  <span className="text-white font-bold" style={{ color: teamA.color }}>
                    {teamA.name}
                  </span>
                </div>
                {currentQuestion.options && (
                  <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
                    {currentQuestion.options.map((option) => {
                      const isCorrect = option.isCorrect;
                      const wasSelected = teamAAnswer === option.id;
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
              </div>
              )}

              {/* Team B Results */}
              {teamB && (
              <div className="mb-6">
                <div className="text-center mb-3">
                  <span className="text-white font-bold" style={{ color: teamB.color }}>
                    {teamB.name}
                  </span>
                </div>
                {currentQuestion.options && (
                  <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
                    {currentQuestion.options.map((option) => {
                      const isCorrect = option.isCorrect;
                      const wasSelected = teamBAnswer === option.id;
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
              </div>
              )}

              <div className="text-center">
                {/* Team A Result */}
                {teamA && (
                <div className="mb-4">
                  <div className="text-lg mb-2" style={{ color: teamA.color }}>
                    {teamA.name}:
                  </div>
                  <div className="text-xl">
                    {teamAAnswer &&
                    currentQuestion.options?.find((o) => o.id === teamAAnswer)
                      ?.isCorrect ? (
                      <span className="text-green-400">إجابة صحيحة! 🎉</span>
                    ) : (
                      <span className="text-red-400">
                        {!teamAAnswer ? 'لم يُجب' : 'إجابة خاطئة 😢'}
                      </span>
                    )}
                  </div>
                </div>
                )}

                {/* Team B Result */}
                {teamB && (
                <div className="mb-6">
                  <div className="text-lg mb-2" style={{ color: teamB.color }}>
                    {teamB.name}:
                  </div>
                  <div className="text-xl">
                    {teamBAnswer &&
                    currentQuestion.options?.find((o) => o.id === teamBAnswer)
                      ?.isCorrect ? (
                      <span className="text-green-400">إجابة صحيحة! 🎉</span>
                    ) : (
                      <span className="text-red-400">
                        {!teamBAnswer ? 'لم يُجب' : 'إجابة خاطئة 😢'}
                      </span>
                    )}
                  </div>
                </div>
                )}

                <Button onClick={handleNextRound} variant="primary" size="lg">
                  الجولة التالية
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Extra Sauce Toggle */}
        <div className="mt-4 text-center">
          <label className="text-white/60 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={extraSauceEnabled}
              onChange={(e) => setExtraSauceEnabled(e.target.checked)}
              className="ml-2"
            />
            تفعيل الصلصة الإضافية
          </label>
        </div>
      </div>
      </div>
    </WoodyBackground>
  );
};

export default LocalGamePage;

