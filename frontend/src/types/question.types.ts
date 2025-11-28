export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// For Order Challenge questions
export interface OrderItem {
  id: string;
  text: string;
  correctPosition: number; // 1, 2, 3, 4...
}

// For Who and Who questions
export interface Person {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Achievement {
  id: string;
  text: string;
  personId: string; // Links to the correct person
}

export interface WhoAndWhoData {
  people: [Person, Person]; // Exactly 2 people
  achievements: [Achievement, Achievement]; // Exactly 2 achievements
}

export interface Question {
  id: string;
  text: string;
  subjectId: string;
  questionTypeId: string;
  options?: QuestionOption[]; // For four-options type
  correctAnswer?: string; // For fill-blank type
  orderItems?: OrderItem[]; // For order-challenge type
  whoAndWhoData?: WhoAndWhoData; // For who-and-who type
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
  createdAt?: Date;
  updatedAt?: Date;
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
