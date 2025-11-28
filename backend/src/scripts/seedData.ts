import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Subject from '../models/Subject.js';
import QuestionType, { IQuestionType } from '../models/QuestionType.js';
import Question from '../models/Question.js';

dotenv.config();

// Generate questions for a subject and type
const generateQuestions = (
  subjectId: mongoose.Types.ObjectId, 
  questionType: IQuestionType, 
  subjectName: string,
  count: number
) => {
  const questions = [];
  const difficulties = ['easy', 'medium', 'hard'] as const;
  
  // Sample question templates for different subjects
  const templates: Record<string, string[]> = {
    'التاريخ': ['متى حدث {event}؟', 'من كان {person}؟', 'أين وقعت {event}؟', 'ما هي عاصمة {country} في {year}؟', 'من قاد {battle}؟'],
    'العلوم': ['ما هو {element}؟', 'كم عدد {thing} في {system}؟', 'ما هي وظيفة {organ}؟', 'ما هو لون {substance}؟', 'كيف يعمل {process}؟'],
    'الجغرافيا': ['ما هي عاصمة {country}؟', 'ما هو أطول {feature} في {region}؟', 'كم عدد سكان {city}؟', 'ما هي عملة {country}؟', 'أين يقع {landmark}؟'],
    'الرياضة': ['من فاز بكأس {tournament} في {year}؟', 'كم عدد اللاعبين في فريق {sport}؟', 'ما هي قواعد {sport}؟', 'من هو أفضل لاعب في {sport}؟'],
    'الأدب': ['من كتب {book}؟', 'ما هي قصة {character}؟', 'من هو شاعر {era}؟', 'ما هي لغة {work} الأصلية؟', 'متى نشر {book}؟'],
    'الرياضيات': ['ما هو ناتج {operation}؟', 'كم يساوي {formula}؟', 'ما هو {concept}؟', 'كيف تحسب {calculation}؟', 'ما هو {shape}؟'],
    'الفن': ['من رسم {artwork}؟', 'ما هي مدرسة {artist} الفنية؟', 'متى أنشئ {monument}؟', 'ما هو أسلوب {artist}؟', 'أين يوجد {artwork}؟'],
    'الموسيقى': ['من لحن {song}؟', 'ما هي آلة {instrument}؟', 'من هو مغني {genre}؟', 'ما هو إيقاع {style}؟', 'متى صدر {album}؟'],
    'الطبخ': ['ما هي مكونات {dish}؟', 'كيف تطبخ {food}؟', 'من أين أتى {cuisine}؟', 'ما هي طريقة تحضير {dish}؟', 'ما هو طعم {ingredient}؟'],
    'التكنولوجيا': ['ما هي وظيفة {device}؟', 'من اخترع {invention}؟', 'كيف يعمل {technology}؟', 'ما هو {concept}؟', 'متى ظهر {tech}؟'],
    // New subjects
    'الفيزياء': ['ما هو قانون {law}؟', 'من اكتشف {particle}؟', 'ما هي وحدة قياس {unit}؟', 'كيف تتفاعل {force}؟'],
    'الكيمياء': ['ما هو الرمز الكيميائي لـ {element}؟', 'ما ناتج تفاعل {compound}؟', 'ما هي درجة غليان {substance}؟'],
    'الأحياء': ['ما هي وظيفة {organelle}؟', 'كيف يتكاثر {organism}؟', 'ما هو تصنيف {species}؟'],
    'الفلك': ['كم يبعد {planet} عن الشمس؟', 'ما هو حجم {star}؟', 'متى يحدث {phenomenon}؟'],
    'علم النفس': ['ما هي نظرية {theorist}؟', 'ما هو تعريف {disorder}؟', 'كيف يؤثر {factor} على السلوك؟'],
    'علم الاجتماع': ['ما هو مفهوم {concept}؟', 'من أسس {school}؟', 'كيف يتطور {society}؟'],
    'الفلسفة': ['من قال {quote}؟', 'ما هي فكرة {philosophy}؟', 'ما هو الفرق بين {concept1} و {concept2}؟'],
    'اللغات': ['ما معنى كلمة {word}؟', 'كيف تترجم {phrase}؟', 'ما هو أصل لغة {language}؟'],
    'الأفلام': ['من أخرج فيلم {movie}؟', 'من مثل دور {character}؟', 'في أي عام صدر {movie}؟'],
    'معلومات عامة': ['ما هو أكبر {thing}؟', 'من هو أول {person}؟', 'أين يقع {place}؟']
  };

  const subjectTemplates = templates[subjectName] || templates['التاريخ'];
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[i % 3];
    const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
    const timeLimit = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20;
    
    const template = subjectTemplates[i % subjectTemplates.length];
    const questionText = `${template} (${questionType.nameAr} - سؤال ${i + 1})`;
    
    let options: Array<{ id: string; text: string; isCorrect: boolean }> = [];
    let correctAnswer = '';

    if (questionType.name === 'Multiple Choice') {
      options = [
        { id: '1', text: `إجابة صحيحة ${i + 1}`, isCorrect: true },
        { id: '2', text: `إجابة خاطئة ${i + 1}-1`, isCorrect: false },
        { id: '3', text: `إجابة خاطئة ${i + 1}-2`, isCorrect: false },
        { id: '4', text: `إجابة خاطئة ${i + 1}-3`, isCorrect: false },
      ];
    } else if (questionType.name === 'True/False') {
      const isTrue = i % 2 === 0;
      options = [
        { id: '1', text: 'صح', isCorrect: isTrue },
        { id: '2', text: 'خطأ', isCorrect: !isTrue },
      ];
    } else if (questionType.name === 'Fill in the Blank') {
      correctAnswer = `الإجابة ${i + 1}`;
    }

    questions.push({
      text: questionText,
      subjectId,
      questionTypeId: questionType._id,
      options: options.length > 0 ? options : undefined,
      correctAnswer: correctAnswer || undefined,
      difficulty,
      points,
      timeLimit,
    });
  }
  
  return questions;
};

const seedData = async () => {
  try {
    await connectDatabase();

    console.log('🗑️  Clearing existing data...');
    await Subject.deleteMany({});
    await QuestionType.deleteMany({});
    await Question.deleteMany({});

    console.log('🌱 Seeding Question Types...');
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

    console.log('🌱 Seeding 20 Subjects...');
    const subjects = await Subject.insertMany([
      { name: 'History', nameAr: 'التاريخ', description: 'أسئلة تاريخية', color: '#ef4444' },
      { name: 'Science', nameAr: 'العلوم', description: 'أسئلة علمية', color: '#3b82f6' },
      { name: 'Sports', nameAr: 'الرياضة', description: 'أسئلة رياضية', color: '#10b981' },
      { name: 'Geography', nameAr: 'الجغرافيا', description: 'أسئلة جغرافية', color: '#f59e0b' },
      { name: 'Literature', nameAr: 'الأدب', description: 'أسئلة أدبية', color: '#8b5cf6' },
      { name: 'Mathematics', nameAr: 'الرياضيات', description: 'أسئلة رياضية', color: '#ec4899' },
      { name: 'Art', nameAr: 'الفن', description: 'أسئلة فنية', color: '#14b8a6' },
      { name: 'Music', nameAr: 'الموسيقى', description: 'أسئلة موسيقية', color: '#f97316' },
      { name: 'Cooking', nameAr: 'الطبخ', description: 'أسئلة طبخ', color: '#eab308' },
      { name: 'Technology', nameAr: 'التكنولوجيا', description: 'أسئلة تقنية', color: '#06b6d4' },
      { name: 'Physics', nameAr: 'الفيزياء', description: 'أسئلة فيزيائية', color: '#6366f1' },
      { name: 'Chemistry', nameAr: 'الكيمياء', description: 'أسئلة كيميائية', color: '#a855f7' },
      { name: 'Biology', nameAr: 'الأحياء', description: 'أسئلة بيولوجية', color: '#22c55e' },
      { name: 'Astronomy', nameAr: 'الفلك', description: 'أسئلة فلكية', color: '#0f172a' },
      { name: 'Psychology', nameAr: 'علم النفس', description: 'أسئلة نفسية', color: '#db2777' },
      { name: 'Sociology', nameAr: 'علم الاجتماع', description: 'أسئلة اجتماعية', color: '#ea580c' },
      { name: 'Philosophy', nameAr: 'الفلسفة', description: 'أسئلة فلسفية', color: '#78716c' },
      { name: 'Languages', nameAr: 'اللغات', description: 'أسئلة لغوية', color: '#0ea5e9' },
      { name: 'Movies', nameAr: 'الأفلام', description: 'أسئلة سينمائية', color: '#be185d' },
      { name: 'General Knowledge', nameAr: 'معلومات عامة', description: 'أسئلة عامة', color: '#64748b' },
    ]);

    console.log('🌱 Generating Questions...');
    const allQuestions = [];
    for (const subject of subjects) {
      for (const qt of questionTypes) {
        // Generate 50 questions per type per subject
        const questions = generateQuestions(subject._id, qt, subject.nameAr, 50);
        allQuestions.push(...questions);
      }
    }

    console.log('💾 Saving Questions...');
    // Insert in chunks to avoid memory issues if too large, though 3000 should be fine
    await Question.insertMany(allQuestions);

    console.log(`✅ Seed data created successfully!`);
    console.log(`   - ${subjects.length} subjects`);
    console.log(`   - ${questionTypes.length} question types`);
    console.log(`   - ${allQuestions.length} questions total (${allQuestions.length / subjects.length} per subject)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
