import React, { useState, useEffect } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useSocket } from '../../hooks/useSocket';
import { GameState, Team, Round } from '../../types/game.types';
import { Subject, QuestionType, Question } from '../../types/question.types';
import { Power } from '../../types/power.types';
import { ScoreBoard } from './ScoreBoard';
import { TeamSelector } from './TeamSelector';
import { SubjectPicker } from './SubjectPicker';
import { QuestionTypePicker } from './QuestionTypePicker';
import { QuestionDisplay } from './QuestionDisplay';
import { ExtraSauceDisplay } from './ExtraSauceDisplay';
import { Button } from '../Shared/Button';
import api from '../../utils/api';
import { applyPowerEffect, calculatePoints } from '../../utils/gameLogic';

interface GameBoardProps {
  gameId?: string;
}

type GamePhase =
  | 'setup'
  | 'select_subject'
  | 'select_type'
  | 'select_sauce'
  | 'question'
  | 'answer_result';

export const GameBoard: React.FC<GameBoardProps> = ({ gameId }) => {
  const {
    gameState,
    setGameState,
    selectedSubject,
    setSelectedSubject,
    selectedQuestionType,
    setSelectedQuestionType,
    currentQuestion,
    setCurrentQuestion,
    reset,
  } = useGameState();

  const socket = useSocket(gameId);
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [usedPowers, setUsedPowers] = useState<string[]>([]);
  const [currentPower, setCurrentPower] = useState<Power | null>(null);
  const [modifiedQuestion, setModifiedQuestion] = useState<Question | null>(null);
  const [modifiedTimeLimit, setModifiedTimeLimit] = useState<number>(30);
  const [playerName] = useState(() => sessionStorage.getItem('playerName') || 'لاعب');
  const [gameMode] = useState(() => sessionStorage.getItem('gameMode') || 'local-no-presenter');

  useEffect(() => {
    if (socket && gameId) {
      socket.on('game-state', (state: GameState) => {
        setGameState(state);
        setTeams(state.teams || []);
        setCurrentRound(state.currentRound || 1);
      });

      socket.on('game-state-updated', (state: GameState) => {
        setGameState(state);
        setTeams(state.teams || []);
        setCurrentRound(state.currentRound || 1);
      });

      socket.on('game-action-local', (data: { action: string; payload: any }) => {
        // Handle local game actions
        console.log('Local game action:', data);
      });
    }
  }, [socket, gameId, setGameState]);

  const handleTeamCreate = (name: string) => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      score: 0,
      role: teams.length === 0 ? 'subject_picker' : 'type_picker',
    };
    setTeams([...teams, newTeam]);
  };

  const handleStartGame = () => {
    if (teams.length < 2) {
      alert('يجب إضافة فريقين على الأقل');
      return;
    }
    setPhase('select_subject');
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setPhase('select_type');
  };

  const handleTypeSelect = (type: QuestionType) => {
    setSelectedQuestionType(type);
    if (gameState?.extraSauceEnabled) {
      setPhase('select_sauce');
    } else {
      loadQuestion();
    }
  };

  const handleSauceSelect = (power: Power) => {
    setUsedPowers([...usedPowers, power.id]);
    setCurrentPower(power);
    loadQuestion(power);
  };

  const loadQuestion = async (power?: Power) => {
    if (!selectedSubject || !selectedQuestionType) return;

    try {
      const response = await api.post(`/games/${gameId}/question`, {
        subjectId: selectedSubject.id,
        questionTypeId: selectedQuestionType.id,
        difficulty: power?.effect === 'higher_difficulty' ? 'hard' : undefined,
      });
      const question = response.data;
      setCurrentQuestion(question);
      
      // Apply power effects
      if (power) {
        const { question: modifiedQ, timeRemaining } = applyPowerEffect(
          question,
          power,
          question.timeLimit
        );
        setModifiedQuestion(modifiedQ);
        setModifiedTimeLimit(timeRemaining);
      } else {
        setModifiedQuestion(question);
        setModifiedTimeLimit(question.timeLimit);
      }
      
      setPhase('question');
    } catch (error: any) {
      console.error('Error loading question:', error);
      // Show error message to user
      alert('فشل تحميل السؤال. تأكد من أن الخادم يعمل.');
    }
  };

  const handleAnswer = (answerId: string, isCorrect: boolean) => {
    if (!currentQuestion || !gameState) return;

    const questionToUse = modifiedQuestion || currentQuestion;
    const points = calculatePoints(
      questionToUse.points,
      isCorrect,
      modifiedTimeLimit,
      currentQuestion.timeLimit,
      questionToUse.difficulty,
      gameState.pointDistribution,
      currentPower?.effect
    );

    const currentTeam = gameState.teams.find(t => t.role === 'subject_picker') || gameState.teams[0];
    const updatedTeams = teams.map((team) => {
      if (team.id === currentTeam.id) {
        return { ...team, score: team.score + points };
      }
      return team;
    });
    setTeams(updatedTeams);

    if (socket && gameId) {
      socket.emit('game-action', {
        gameId,
        action: 'answer-question',
        payload: {
          teamId: currentTeam.id,
          isCorrect,
          points,
        },
      });
    }

    setTimeout(() => {
      setPhase('answer_result');
      setTimeout(() => {
        setCurrentRound(currentRound + 1);
        setPhase('select_subject');
        setSelectedSubject(null);
        setSelectedQuestionType(null);
        setCurrentQuestion(null);
        setModifiedQuestion(null);
        setCurrentPower(null);
        setModifiedTimeLimit(30);
      }, 3000);
    }, 2000);
  };

  const handleTimeUp = () => {
    handleAnswer('', false);
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            لعبة الأسئلة العربية
          </h1>
          <TeamSelector onTeamCreate={handleTeamCreate} teams={teams} />
          {teams.length >= 2 && (
            <div className="text-center">
              <Button onClick={handleStartGame} size="lg">
                بدء اللعبة
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            الجولة {currentRound}
          </h1>
          <div className="text-white/80">
            مرحباً، {playerName}
          </div>
        </div>

        <ScoreBoard teams={teams} />

        {phase === 'select_subject' && (
          <SubjectPicker
            onSelect={handleSubjectSelect}
            selectedSubject={selectedSubject}
          />
        )}

        {phase === 'select_type' && (
          <QuestionTypePicker
            onSelect={handleTypeSelect}
            selectedType={selectedQuestionType}
          />
        )}

        {phase === 'select_sauce' && (
          <ExtraSauceDisplay
            enabled={gameState?.extraSauceEnabled || false}
            onSelect={handleSauceSelect}
            usedPowers={usedPowers}
          />
        )}

        {phase === 'question' && (modifiedQuestion || currentQuestion) && (
          <QuestionDisplay
            question={modifiedQuestion || currentQuestion!}
            onAnswer={handleAnswer}
            timeLimit={modifiedTimeLimit}
            onTimeUp={handleTimeUp}
          />
        )}

        {phase === 'answer_result' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {teams[0]?.score !== undefined
                ? `النقاط: ${teams[0].score}`
                : 'انتهى الوقت'}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

