import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const seedMoviesTVFourOptions = async () => {
  try {
    await connectDatabase();

    // Find or create Movies and TV Shows subject
    let moviesSubject = await Subject.findOne({ name: 'Movies and TV Shows' });
    if (!moviesSubject) {
      moviesSubject = await Subject.create({
        name: 'Movies and TV Shows',
        nameAr: 'الأفلام والمسلسلات',
        description: 'أسئلة حول الأفلام والمسلسلات التلفزيونية',
        color: '#f59e0b'
      });
      console.log('✅ Created Movies and TV Shows subject');
    } else {
      console.log('✅ Movies and TV Shows subject already exists');
    }
    const subjectId = moviesSubject._id;

    console.log('🌱 Adding Movies and TV Shows Four Options Questions...');

    // Read questions from JSON file using absolute path
    const workspacePath = 'C:\\Projects\\Game i dont have name for yet';
    const questionsFilePath = path.join(
      workspacePath,
      'questions safe place',
      'movies and tv shows-one of 4'
    );
    
    if (!fs.existsSync(questionsFilePath)) {
      throw new Error(`File not found: ${questionsFilePath}`);
    }
    
    const fileContent = fs.readFileSync(questionsFilePath, 'utf-8').trim();
    if (!fileContent || fileContent.length === 0) {
      throw new Error(`File is empty: ${questionsFilePath}`);
    }
    
    const questionsData = JSON.parse(fileContent);

    // Prepare questions for insertion
    const questionsToInsert = questionsData.map((q: any) => ({
      text: q.text,
      subjectId: subjectId,
      questionTypeId: 'four-options',
      options: q.options,
      difficulty: q.difficulty || 'easy',
      points: q.points || (q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20),
      timeLimit: q.timeLimit || 30,
    }));

    // Insert questions
    await Question.insertMany(questionsToInsert);

    console.log(`✅ تم إضافة ${questionsToInsert.length} سؤال عن الأفلام والمسلسلات (4 خيارات)!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

seedMoviesTVFourOptions();
