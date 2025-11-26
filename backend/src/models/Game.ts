import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  status: 'waiting' | 'active' | 'paused' | 'finished';
  teams: Array<{
    id: string;
    name: string;
    score: number;
    role: 'subject_picker' | 'type_picker';
  }>;
  currentRound: number;
  rounds: Array<{
    id: string;
    number: number;
    subjectId?: mongoose.Types.ObjectId;
    questionTypeId?: mongoose.Types.ObjectId;
    questionId?: mongoose.Types.ObjectId;
    extraSauce?: {
      id: string;
      powerId: string;
      applied: boolean;
      appliedAt?: Date;
    };
    currentTeamId: string;
    timeRemaining: number;
    startedAt?: Date;
    answeredAt?: Date;
    isCorrect?: boolean;
    pointsAwarded: number;
  }>;
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

const GameSchema = new Schema<IGame>(
  {
    status: { type: String, enum: ['waiting', 'active', 'paused', 'finished'], default: 'waiting' },
    teams: [{
      id: String,
      name: String,
      score: { type: Number, default: 0 },
      role: { type: String, enum: ['subject_picker', 'type_picker'] },
    }],
    currentRound: { type: Number, default: 0 },
    rounds: [{
      id: String,
      number: Number,
      subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
      questionTypeId: { type: Schema.Types.ObjectId, ref: 'QuestionType' },
      questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
      extraSauce: {
        id: String,
        powerId: String,
        applied: Boolean,
        appliedAt: Date,
      },
      currentTeamId: String,
      timeRemaining: Number,
      startedAt: Date,
      answeredAt: Date,
      isCorrect: Boolean,
      pointsAwarded: { type: Number, default: 0 },
    }],
    extraSauceEnabled: { type: Boolean, default: true },
    pointDistribution: {
      correct: { type: Number, default: 10 },
      timeBonus: { type: Number, default: 5 },
      difficultyMultiplier: { type: Boolean, default: true },
    },
    hostId: String,
  },
  { timestamps: true }
);

export default mongoose.model<IGame>('Game', GameSchema);

