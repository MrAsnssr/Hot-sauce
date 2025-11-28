import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Question from '../models/Question.js';

dotenv.config();

const deleteAllQuestions = async () => {
  try {
    await connectDatabase();

    console.log('🗑️  جاري حذف جميع الأسئلة...');
    const result = await Question.deleteMany({});
    
    console.log(`✅ تم حذف ${result.deletedCount} سؤال بنجاح!`);
    console.log('💡 يمكنك الآن تشغيل seed script لإضافة الأسئلة الجديدة');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في حذف الأسئلة:', error);
    process.exit(1);
  }
};

deleteAllQuestions();

