import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const seedFootballOrder = async () => {
  try {
    await connectDatabase();

    let footballSubject = await Subject.findOne({ name: 'Football' });
    if (!footballSubject) {
      footballSubject = await Subject.create({
        name: 'Football',
        nameAr: 'كرة القدم',
        description: 'أسئلة حول كرة القدم والبطولات',
        color: '#22c55e'
      });
    }
    const subjectId = footballSubject._id;

    console.log('🌱 Adding Football Order Questions...');

    // Use absolute workspace path
    const workspacePath = 'C:\\Projects\\Game i dont have name for yet';
    const questionsFilePath = path.join(
      workspacePath,
      'questions safe place',
      'football-order'
    );
    
    if (!fs.existsSync(questionsFilePath)) {
      throw new Error(`File not found: ${questionsFilePath}`);
    }
    
    const fileContent = fs.readFileSync(questionsFilePath, 'utf-8').trim();
    if (!fileContent) {
      throw new Error(`File is empty: ${questionsFilePath}`);
    }
    
    const questionsData = JSON.parse(fileContent);

    const questionsToInsert = questionsData.map((q: any) => ({
      text: q.text,
      subjectId: subjectId,
      questionTypeId: 'order-challenge',
      orderItems: q.orderItems,
      difficulty: q.difficulty || 'medium',
      points: q.points || (q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20),
      timeLimit: q.timeLimit || 45,
    }));

    await Question.insertMany(questionsToInsert);

    console.log(`✅ تم إضافة ${questionsToInsert.length} سؤال عن كرة القدم (ترتيب)!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

seedFootballOrder();

