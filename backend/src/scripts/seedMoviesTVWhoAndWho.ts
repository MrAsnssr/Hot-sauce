import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const seedMoviesTVWhoAndWho = async () => {
  try {
    await connectDatabase();

    let moviesSubject = await Subject.findOne({ name: 'Movies and TV Shows' });
    if (!moviesSubject) {
      moviesSubject = await Subject.create({
        name: 'Movies and TV Shows',
        nameAr: 'الأفلام والمسلسلات',
        description: 'أسئلة حول الأفلام والمسلسلات التلفزيونية',
        color: '#f59e0b'
      });
    }
    const subjectId = moviesSubject._id;

    console.log('🌱 Adding Movies and TV Shows Who and Who Questions...');

    const projectRoot = path.resolve(process.cwd(), '..');
    const questionsFilePath = path.join(projectRoot, 'questions safe place', 'moviestvshoes-whoandwho.txt');
    
    const fileContent = fs.readFileSync(questionsFilePath, 'utf-8').trim();
    const questionsData = JSON.parse(fileContent);

    const questionsToInsert = questionsData.map((q: any) => ({
      text: q.text,
      subjectId: subjectId,
      questionTypeId: 'who-and-who',
      whoAndWhoData: q.whoAndWhoData,
      difficulty: q.difficulty || 'easy',
      points: q.points || (q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20),
      timeLimit: q.timeLimit || 50,
    }));

    await Question.insertMany(questionsToInsert);

    console.log(`✅ تم إضافة ${questionsToInsert.length} سؤال عن الأفلام والمسلسلات (من ومن)!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

seedMoviesTVWhoAndWho();
