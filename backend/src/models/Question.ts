import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  text: string;
  subjectId: mongoose.Types.ObjectId;
  questionTypeId: mongoose.Types.ObjectId;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer?: string;
  imageUrl?: string;
  audioUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    questionTypeId: { type: Schema.Types.ObjectId, ref: 'QuestionType', required: true },
    options: [{
      id: String,
      text: String,
      isCorrect: Boolean,
    }],
    correctAnswer: String,
    imageUrl: String,
    audioUrl: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    points: { type: Number, default: 10 },
    timeLimit: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>('Question', QuestionSchema);

