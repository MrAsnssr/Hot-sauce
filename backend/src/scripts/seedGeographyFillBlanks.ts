import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';

dotenv.config();

const seedGeographyFillBlanks = async () => {
  try {
    await connectDatabase();

    // Find or create Geography subject
    let geographySubject = await Subject.findOne({ name: 'Geography' });
    if (!geographySubject) {
      geographySubject = await Subject.create({
        name: 'Geography',
        nameAr: 'الجغرافيا',
        description: 'أسئلة جغرافية',
        color: '#10b981'
      });
    }
    const subjectId = geographySubject._id;

    console.log('🌱 Adding Geography Fill-in-the-Blank Questions...');

    // Geography fill-in-the-blank questions
    const questionsData = [
      { text: "تقع دولة مصر في قارة ________.", correctAnswer: "أفريقيا", difficulty: "easy" },
      { text: "أطول نهر في العالم هو نهر ________.", correctAnswer: "النيل", difficulty: "easy" },
      { text: "عاصمة اليابان هي مدينة ________.", correctAnswer: "طوكيو", difficulty: "easy" },
      { text: "أعلى قمة جبلية في العالم هي جبل ________.", correctAnswer: "إفرست", difficulty: "easy" },
      { text: "البحر الأحمر يفصل بين قارتي ________ وآسيا.", correctAnswer: "أفريقيا", difficulty: "easy" },
      { text: "أكبر صحراء في العالم هي صحراء ________.", correctAnswer: "الصحراء الكبرى", difficulty: "easy" },
      { text: "دولة الفاتيكان تقع داخل مدينة ________.", correctAnswer: "روما", difficulty: "medium" },
      { text: "قناة بنما تربط بين المحيط الأطلسي والمحيط ________.", correctAnswer: "الهادئ", difficulty: "easy" },
      { text: "أكبر بحيرة ماء عذب في العالم هي بحيرة ________.", correctAnswer: "بايكال", difficulty: "medium" },
      { text: "جبال الألب تمتد عبر عدة دول أوروبية منها ________ وفرنسا.", correctAnswer: "سويسرا", difficulty: "medium" },
      { text: "أكبر جزيرة في العالم هي ________.", correctAnswer: "غرينلاند", difficulty: "easy" },
      { text: "عاصمة أستراليا هي مدينة ________.", correctAnswer: "كانبرا", difficulty: "medium" },
      { text: "نهر الأمازون يصب في المحيط ________.", correctAnswer: "الأطلسي", difficulty: "easy" },
      { text: "أكبر دولة في العالم من حيث المساحة هي ________.", correctAnswer: "روسيا", difficulty: "easy" },
      { text: "الدولة الوحيدة التي تقع في قارتين هي ________.", correctAnswer: "تركيا", difficulty: "medium" },
      { text: "أدنى نقطة على سطح الأرض هي شاطئ البحر ________.", correctAnswer: "الميت", difficulty: "medium" },
      { text: "جزر المالديف تقع في المحيط ________.", correctAnswer: "الهندي", difficulty: "easy" },
      { text: "عاصمة البرازيل هي مدينة ________.", correctAnswer: "برازيليا", difficulty: "medium" },
      { text: "الصحراء العربية تقع بشكل رئيسي في ________.", correctAnswer: "السعودية", difficulty: "easy" },
      { text: "أكبر خليج في العالم هو خليج ________.", correctAnswer: "المكسيك", difficulty: "hard" },
      { text: "دولة موناكو تقع على ساحل ________.", correctAnswer: "المتوسط", difficulty: "medium" },
      { text: "أكبر بحيرة مالحة في العالم هي بحر ________.", correctAnswer: "قزوين", difficulty: "hard" },
      { text: "جبال الهملايا تفصل بين الهند و________.", correctAnswer: "الصين", difficulty: "easy" },
      { text: "عاصمة كندا هي مدينة ________.", correctAnswer: "أوتاوا", difficulty: "medium" },
      { text: "أكبر شبه جزيرة في العالم هي شبه الجزيرة ________.", correctAnswer: "العربية", difficulty: "medium" },
      { text: "الدولة التي تُعرف باسم بلاد الشمس المشرقة هي ________.", correctAnswer: "اليابان", difficulty: "easy" },
      { text: "نهر الدانوب يمر عبر ________ دول أوروبية.", correctAnswer: "10", difficulty: "hard" },
      { text: "أصغر قارة في العالم هي ________.", correctAnswer: "أستراليا", difficulty: "easy" },
      { text: "عاصمة جنوب أفريقيا الإدارية هي ________.", correctAnswer: "بريتوريا", difficulty: "hard" },
      { text: "جزر الكناري تتبع إدارياً لدولة ________.", correctAnswer: "إسبانيا", difficulty: "medium" },
      { text: "أكبر مدينة في العالم من حيث عدد السكان هي ________.", correctAnswer: "طوكيو", difficulty: "easy" },
      { text: "البحر الكاريبي يقع جنوب ________.", correctAnswer: "الولايات المتحدة", difficulty: "medium" },
      { text: "أعمق نقطة في المحيطات هي خندق ________.", correctAnswer: "ماريانا", difficulty: "hard" },
      { text: "دولة ليختنشتاين تقع بين سويسرا و________.", correctAnswer: "النمسا", difficulty: "medium" },
      { text: "شلالات نياغارا تقع على الحدود بين كندا و________.", correctAnswer: "الولايات المتحدة", difficulty: "easy" },
      { text: "عاصمة المكسيك هي ________ سيتي.", correctAnswer: "مكسيكو", difficulty: "easy" },
      { text: "أكبر دلتا نهرية في العالم هي دلتا نهر ________.", correctAnswer: "الغانج", difficulty: "hard" },
      { text: "جبال الروكي تمتد في غرب ________.", correctAnswer: "أمريكا الشمالية", difficulty: "medium" },
      { text: "دولة سان مارينو محاطة كلياً بـ________.", correctAnswer: "إيطاليا", difficulty: "medium" },
      { text: "البحر الأسود يطل عليه من الجنوب دولة ________.", correctAnswer: "تركيا", difficulty: "easy" },
      { text: "أكبر بحيرة في أفريقيا هي بحيرة ________.", correctAnswer: "فيكتوريا", difficulty: "medium" },
      { text: "عاصمة الأرجنتين هي ________ آيرس.", correctAnswer: "بوينس", difficulty: "easy" },
      { text: "جزر الفوكلاند تتبع إدارياً لـ________.", correctAnswer: "بريطانيا", difficulty: "hard" },
      { text: "نهر الفولغا هو أطول نهر في ________.", correctAnswer: "أوروبا", difficulty: "medium" },
      { text: "أكبر دولة بدون منفذ بحري هي ________.", correctAnswer: "كازاخستان", difficulty: "hard" },
      { text: "مدينة اسطنبول تقع على مضيق ________.", correctAnswer: "البوسفور", difficulty: "medium" },
      { text: "عاصمة نيوزيلندا هي مدينة ________.", correctAnswer: "ويلينغتون", difficulty: "medium" },
      { text: "الصحراء الكبرى تمتد عبر شمال قارة ________.", correctAnswer: "أفريقيا", difficulty: "easy" },
      { text: "أكبر دولة في أمريكا الجنوبية هي ________.", correctAnswer: "البرازيل", difficulty: "easy" },
      { text: "شبه جزيرة سيناء تتبع جغرافياً لقارة ________.", correctAnswer: "آسيا", difficulty: "medium" },
    ];

    // Prepare questions for insertion
    const questionsToInsert = questionsData.map((q: any) => ({
      text: q.text,
      subjectId: subjectId,
      questionTypeId: 'fill-blank',
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty || 'easy',
      points: q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20,
      timeLimit: 40,
    }));

    // Insert questions
    await Question.insertMany(questionsToInsert);

    console.log(`✅ تم إضافة ${questionsToInsert.length} سؤال جغرافي (ملء الفراغ)!`);
    console.log(`   - جميع الأسئلة من نوع: ملء الفراغ`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

seedGeographyFillBlanks();

