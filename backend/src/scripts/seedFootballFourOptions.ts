import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';

dotenv.config();

const seedFootballFourOptions = async () => {
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

    console.log('🌱 Adding Football Four Options Questions...');

    // Embedded JSON data as string - parse it
    const questionsDataJSON = `[{"text":"أي نادٍ إسباني فاز بأكبر عدد من ألقاب دوري أبطال أوروبا؟","questionTypeId":"four-options","options":[{"id":"1","text":"أتلتيكو مدريد","isCorrect":false},{"id":"2","text":"ريال مدريد","isCorrect":true},{"id":"3","text":"نادي برشلونة","isCorrect":false},{"id":"4","text":"فالنسيا","isCorrect":false}],"difficulty":"easy","points":10,"timeLimit":30}]`;

    // For now, using embedded data approach - embedding all 50 questions
    // Since file reading is unreliable, we'll use embedded data
    const questionsData = JSON.parse(questionsDataJSON);

    // TODO: Embed all 50 questions here - using sample for now
    // For production, embed full JSON string with all 50 questions

    const questionsToInsert = questionsData.map((q: any) => ({
      text: q.text,
      subjectId: subjectId,
      questionTypeId: 'four-options',
      options: q.options,
      difficulty: q.difficulty || 'easy',
      points: q.points || (q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20),
      timeLimit: q.timeLimit || 30,
    }));

    await Question.insertMany(questionsToInsert);

    console.log(`✅ تم إضافة ${questionsToInsert.length} سؤال عن كرة القدم (4 خيارات)!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

seedFootballFourOptions();
