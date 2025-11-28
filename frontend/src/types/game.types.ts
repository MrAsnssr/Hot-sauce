import { Question, Subject, QuestionType } from './question.types';
import { ExtraSauce } from './power.types';

export type GameStatus = 'waiting' | 'active' | 'paused' | 'finished';

export type PlayerRole = 'subject_picker' | 'type_picker';

export interface Player {
  id: string;
  name: string;
  score: number;
  role?: PlayerRole;
  color?: string;
}

export interface Round {
  id: string;
  number: number;
  subject?: Subject;
  questionType?: QuestionType;
  question?: Question;
  extraSauce?: ExtraSauce;
  currentPlayerId: string;
  timeRemaining: number;
  startedAt?: Date;
  answeredAt?: Date;
  isCorrect?: boolean;
  pointsAwarded: number;
}

export interface GameState {
  id: string;
  status: GameStatus;
  players: Player[];
  currentRound: number;
  rounds: Round[];
  extraSauceEnabled: boolean;
  pointDistribution: {
    correct: number;
    timeBonus: number;
    difficultyMultiplier: boolean;
  };
  hostId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSettings {
  extraSauceEnabled: boolean;
  pointDistribution: {
    correct: number;
    timeBonus: number;
    difficultyMultiplier: boolean;
  };
  defaultTimeLimit: number;
}

