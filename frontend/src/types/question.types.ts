export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  subjectId: string;
  questionTypeId: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  imageUrl?: string;
  audioUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionType {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  requiresOptions: boolean;
  requiresTextAnswer: boolean;
  supportsImage: boolean;
  supportsAudio: boolean;
  defaultTimeLimit: number;
  validationRules?: Record<string, any>;
}

export interface Subject {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

