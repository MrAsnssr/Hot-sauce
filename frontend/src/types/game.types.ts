import { Question, Subject, QuestionType } from './question.types';
import { ExtraSauce } from './power.types';

export type GameStatus = 'waiting' | 'active' | 'paused' | 'finished';

export type TeamRole = 'subject_picker' | 'type_picker';

export interface Team {
  id: string;
  name: string;
  score: number;
  role: TeamRole;
}

export interface Round {
  id: string;
  number: number;
  subject?: Subject;
  questionType?: QuestionType;
  question?: Question;
  extraSauce?: ExtraSauce;
  currentTeamId: string;
  timeRemaining: number;
  startedAt?: Date;
  answeredAt?: Date;
  isCorrect?: boolean;
  pointsAwarded: number;
}

export interface GameState {
  id: string;
  status: GameStatus;
  teams: Team[];
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

