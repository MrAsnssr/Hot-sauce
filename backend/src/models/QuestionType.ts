import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionType extends Document {
  name: string;
  nameAr: string;
  description: string;
  requiresOptions: boolean;
  requiresTextAnswer: boolean;
  supportsImage: boolean;
  supportsAudio: boolean;
  defaultTimeLimit: number;
  validationRules?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<IQuestionType>(
  {
    name: { type: String, required: true },
    nameAr: { type: String, required: true },
    description: { type: String, required: true },
    requiresOptions: { type: Boolean, default: false },
    requiresTextAnswer: { type: Boolean, default: false },
    supportsImage: { type: Boolean, default: false },
    supportsAudio: { type: Boolean, default: false },
    defaultTimeLimit: { type: Number, default: 30 },
    validationRules: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestionType>('QuestionType', QuestionTypeSchema);

