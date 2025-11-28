import mongoose, { Schema, Document } from 'mongoose';

// For Order Challenge questions
interface IOrderItem {
  id: string;
  text: string;
  correctPosition: number;
}

// For Who and Who questions
interface IPerson {
  id: string;
  name: string;
  imageUrl?: string;
}

interface IAchievement {
  id: string;
  text: string;
  personId: string;
}

interface IWhoAndWhoData {
  people: [IPerson, IPerson];
  achievements: [IAchievement, IAchievement];
}

export interface IQuestion extends Document {
  text: string;
  subjectId: mongoose.Types.ObjectId;
  questionTypeId: mongoose.Types.ObjectId | string;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer?: string;
  orderItems?: IOrderItem[];
  whoAndWhoData?: IWhoAndWhoData;
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
    questionTypeId: { type: Schema.Types.Mixed, required: true }, // Can be ObjectId or string
    options: [{
      id: String,
      text: String,
      isCorrect: Boolean,
    }],
    correctAnswer: String,
    orderItems: [{
      id: String,
      text: String,
      correctPosition: Number,
    }],
    whoAndWhoData: {
      people: [{
        id: String,
        name: String,
        imageUrl: String,
      }],
      achievements: [{
        id: String,
        text: String,
        personId: String,
      }],
    },
    imageUrl: String,
    audioUrl: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    points: { type: Number, default: 10 },
    timeLimit: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>('Question', QuestionSchema);
