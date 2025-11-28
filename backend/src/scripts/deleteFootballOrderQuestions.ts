import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';

dotenv.config();

const deleteFootballOrderQuestions = async () => {
  try {
    await connectDatabase();

    // Find Football subject
    const footballSubject = await Subject.findOne({ name: 'Football' });
    if (!footballSubject) {
      console.log('❌ Football subject not found');
      process.exit(1);
    }

    const subjectId = footballSubject._id;
    console.log('🔍 Found Football subject:', footballSubject.nameAr);

    // Find all order-challenge questions for Football
    const orderQuestions = await Question.find({
      subjectId: subjectId,
      questionTypeId: 'order-challenge'
    });

    console.log(`📊 Found ${orderQuestions.length} Football order questions`);

    if (orderQuestions.length === 0) {
      console.log('✅ No Football order questions to delete');
      process.exit(0);
    }

    // Delete all Football order questions
    const result = await Question.deleteMany({
      subjectId: subjectId,
      questionTypeId: 'order-challenge'
    });

    console.log(`✅ Deleted ${result.deletedCount} Football order question(s)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

deleteFootballOrderQuestions();

