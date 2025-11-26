import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Subject from '../models/Subject.js';
import QuestionType from '../models/QuestionType.js';
import Question from '../models/Question.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDatabase();

    // Clear existing data
    await Subject.deleteMany({});
    await QuestionType.deleteMany({});
    await Question.deleteMany({});

    // Seed Subjects
    const subjects = await Subject.insertMany([
      {
        name: 'History',
        nameAr: 'التاريخ',
        description: 'أسئلة تاريخية',
        color: '#ef4444',
      },
      {
        name: 'Science',
        nameAr: 'العلوم',
        description: 'أسئلة علمية',
        color: '#3b82f6',
      },
      {
        name: 'Sports',
        nameAr: 'الرياضة',
        description: 'أسئلة رياضية',
        color: '#10b981',
      },
      {
        name: 'Geography',
        nameAr: 'الجغرافيا',
        description: 'أسئلة جغرافية',
        color: '#f59e0b',
      },
      {
        name: 'Literature',
        nameAr: 'الأدب',
        description: 'أسئلة أدبية',
        color: '#8b5cf6',
      },
    ]);

    // Seed Question Types
    const questionTypes = await QuestionType.insertMany([
      {
        name: 'Multiple Choice',
        nameAr: 'اختيار من متعدد',
        description: 'سؤال باختيارات متعددة',
        requiresOptions: true,
        requiresTextAnswer: false,
        supportsImage: true,
        supportsAudio: false,
        defaultTimeLimit: 30,
      },
      {
        name: 'True/False',
        nameAr: 'صح/خطأ',
        description: 'سؤال صح أو خطأ',
        requiresOptions: true,
        requiresTextAnswer: false,
        supportsImage: false,
        supportsAudio: false,
        defaultTimeLimit: 20,
      },
      {
        name: 'Fill in the Blank',
        nameAr: 'املأ الفراغ',
        description: 'سؤال بملء الفراغ',
        requiresOptions: false,
        requiresTextAnswer: true,
        supportsImage: false,
        supportsAudio: false,
        defaultTimeLimit: 40,
      },
    ]);

    // Seed Sample Questions
    await Question.insertMany([
      {
        text: 'ما هي عاصمة المملكة العربية السعودية؟',
        subjectId: subjects[3]._id,
        questionTypeId: questionTypes[0]._id,
        options: [
          { id: '1', text: 'الرياض', isCorrect: true },
          { id: '2', text: 'جدة', isCorrect: false },
          { id: '3', text: 'الدمام', isCorrect: false },
          { id: '4', text: 'مكة', isCorrect: false },
        ],
        difficulty: 'easy',
        points: 10,
        timeLimit: 30,
      },
      {
        text: 'هل الشمس أكبر من القمر؟',
        subjectId: subjects[1]._id,
        questionTypeId: questionTypes[1]._id,
        options: [
          { id: '1', text: 'صح', isCorrect: true },
          { id: '2', text: 'خطأ', isCorrect: false },
        ],
        difficulty: 'easy',
        points: 10,
        timeLimit: 20,
      },
    ]);

    console.log('✅ Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

