import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import { connectDatabase } from '../config/database.js';

// Question types
const QUESTION_TYPES = [
  { id: 'multiple-choice', nameAr: 'اختيار من متعدد', timeLimit: 30 },
  { id: 'true-false', nameAr: 'صح/خطأ', timeLimit: 20 },
  { id: 'fill-blank', nameAr: 'املأ الفراغ', timeLimit: 40 },
  { id: 'image-guess', nameAr: 'تخمين الصورة', timeLimit: 25 },
  { id: 'comparison-question', nameAr: 'سؤال المقارنة', timeLimit: 35 },
  { id: 'order-challenge', nameAr: 'تحدي الترتيب', timeLimit: 45 },
  { id: 'matching-game', nameAr: 'لعبة المطابقة', timeLimit: 50 },
  { id: 'rapid-fire', nameAr: 'إطلاق سريع', timeLimit: 15 },
  { id: 'reverse-challenge', nameAr: 'تحدي معكوس', timeLimit: 30 },
];

// 20 diverse subjects
const SUBJECTS = [
  { name: 'History', nameAr: 'التاريخ', color: '#8b5cf6', description: 'أسئلة عن التاريخ العربي والعالمي' },
  { name: 'Science', nameAr: 'العلوم', color: '#3b82f6', description: 'أسئلة علمية متنوعة' },
  { name: 'Geography', nameAr: 'الجغرافيا', color: '#10b981', description: 'أسئلة عن البلدان والمدن' },
  { name: 'Math', nameAr: 'الرياضيات', color: '#f59e0b', description: 'أسئلة رياضية' },
  { name: 'Literature', nameAr: 'الأدب', color: '#ec4899', description: 'أسئلة عن الأدب العربي' },
  { name: 'Sports', nameAr: 'الرياضة', color: '#ef4444', description: 'أسئلة رياضية' },
  { name: 'Religion', nameAr: 'الدين', color: '#6366f1', description: 'أسئلة دينية' },
  { name: 'Culture', nameAr: 'الثقافة', color: '#14b8a6', description: 'أسئلة ثقافية عربية' },
  { name: 'Technology', nameAr: 'التكنولوجيا', color: '#06b6d4', description: 'أسئلة تقنية' },
  { name: 'Food', nameAr: 'الطعام', color: '#f97316', description: 'أسئلة عن الطعام والطبخ' },
  { name: 'Animals', nameAr: 'الحيوانات', color: '#84cc16', description: 'أسئلة عن الحيوانات' },
  { name: 'Music', nameAr: 'الموسيقى', color: '#a855f7', description: 'أسئلة موسيقية' },
  { name: 'Movies', nameAr: 'الأفلام', color: '#e11d48', description: 'أسئلة عن الأفلام' },
  { name: 'Nature', nameAr: 'الطبيعة', color: '#22c55e', description: 'أسئلة عن الطبيعة' },
  { name: 'Languages', nameAr: 'اللغات', color: '#0ea5e9', description: 'أسئلة عن اللغات' },
  { name: 'Medicine', nameAr: 'الطب', color: '#dc2626', description: 'أسئلة طبية' },
  { name: 'Art', nameAr: 'الفن', color: '#d946ef', description: 'أسئلة فنية' },
  { name: 'Philosophy', nameAr: 'الفلسفة', color: '#7c3aed', description: 'أسئلة فلسفية' },
  { name: 'Economics', nameAr: 'الاقتصاد', color: '#059669', description: 'أسئلة اقتصادية' },
  { name: 'Astronomy', nameAr: 'الفلك', color: '#1e40af', description: 'أسئلة فلكية' },
];

// Question templates by subject
const QUESTION_TEMPLATES: Record<string, string[]> = {
  'التاريخ': [
    'متى حدثت معركة بدر؟',
    'من هو أول خليفة في الإسلام؟',
    'في أي عام سقطت بغداد على يد المغول؟',
    'من هو مؤسس الدولة العباسية؟',
    'ما هي عاصمة الدولة الأموية؟',
  ],
  'العلوم': [
    'كم عدد الكروموسومات في الإنسان؟',
    'ما هو أكبر كوكب في المجموعة الشمسية؟',
    'ما هي الصيغة الكيميائية للماء؟',
    'ما هو أسرع حيوان بري؟',
    'ما هي درجة غليان الماء عند مستوى سطح البحر؟',
  ],
  'الجغرافيا': [
    'ما هي أكبر دولة في العالم من حيث المساحة؟',
    'ما هي عاصمة أستراليا؟',
    'ما هو أطول نهر في العالم؟',
    'في أي قارة تقع مصر؟',
    'ما هي أصغر دولة في العالم؟',
  ],
  'الرياضيات': [
    'ما هو ناتج 15 × 15؟',
    'كم يساوي 2 أس 10؟',
    'ما هو العدد الأولي الأصغر؟',
    'ما هو محيط الدائرة التي نصف قطرها 7؟',
    'ما هو جذر 144؟',
  ],
  'الأدب': [
    'من هو مؤلف كتاب "الأيام"؟',
    'ما هي أشهر رواية لنجيب محفوظ؟',
    'من هو شاعر النيل؟',
    'ما هو ديوان المتنبي؟',
    'من كتب "ليالي ألف ليلة وليلة"؟',
  ],
  'الرياضة': [
    'كم عدد اللاعبين في فريق كرة القدم؟',
    'ما هي مدة شوط كرة السلة؟',
    'في أي عام أقيمت أول دورة أولمبية حديثة؟',
    'ما هي رياضة محمد علي كلاي؟',
    'كم عدد أهداف كريستيانو رونالدو في كأس العالم؟',
  ],
  'الدين': [
    'كم عدد أركان الإسلام؟',
    'ما هي أول سورة في القرآن الكريم؟',
    'كم عدد سور القرآن الكريم؟',
    'ما هو شهر الصوم في الإسلام؟',
    'من هو أول نبي في الإسلام؟',
  ],
  'الثقافة': [
    'ما هي اللغة الرسمية في 22 دولة عربية؟',
    'ما هو عيد الفطر؟',
    'ما هي عاصمة الثقافة العربية 2023؟',
    'من هو أشهر شاعر عربي في العصر الحديث؟',
    'ما هو المهرجان الأكبر في العالم العربي؟',
  ],
  'التكنولوجيا': [
    'ما هي لغة البرمجة الأكثر استخداماً؟',
    'من هو مؤسس شركة مايكروسوفت؟',
    'ما هو نظام التشغيل الأكثر استخداماً؟',
    'ما هي سرعة الإنترنت القياسية؟',
    'ما هو أكبر موقع تواصل اجتماعي؟',
  ],
  'الطعام': [
    'ما هو الطبق الوطني في السعودية؟',
    'من أين يأتي الكافيار؟',
    'ما هي المكونات الأساسية للحمص؟',
    'ما هو أصل طبق الباستا؟',
    'ما هي الفاكهة الأكثر استهلاكاً في العالم؟',
  ],
  'الحيوانات': [
    'ما هو أسرع حيوان في العالم؟',
    'كم قلب للأخطبوط؟',
    'ما هو أكبر حيوان في العالم؟',
    'ما هو الحيوان الوطني في الصين؟',
    'كم سنة يعيش الفيل؟',
  ],
  'الموسيقى': [
    'من هو مؤلف "الفصول الأربعة"؟',
    'ما هي آلة العود؟',
    'من هو أشهر مغني عربي؟',
    'ما هي الآلة الموسيقية الأكثر تعقيداً؟',
    'من هو "ملك البوب"؟',
  ],
  'الأفلام': [
    'ما هي أعلى فيلم إيرادات في التاريخ؟',
    'من هو الممثل الأكثر أجراً في العالم؟',
    'ما هي جنسية المخرج كريستوفر نولان؟',
    'ما هو فيلم الرسوم المتحركة الأكثر نجاحاً؟',
    'من هو الممثل العربي الأكثر شهرة عالمياً؟',
  ],
  'الطبيعة': [
    'ما هو أطول جبل في العالم؟',
    'ما هي أكبر صحراء في العالم؟',
    'ما هو أعمق محيط؟',
    'ما هي أكبر شجرة في العالم؟',
    'ما هو أطول نهر في أفريقيا؟',
  ],
  'اللغات': [
    'كم عدد اللغات في العالم؟',
    'ما هي اللغة الأكثر تحدثاً في العالم؟',
    'ما هي اللغة الرسمية في البرازيل؟',
    'كم عدد الحروف في اللغة العربية؟',
    'ما هي اللغة الأصعب في العالم؟',
  ],
  'الطب': [
    'كم عدد العظام في جسم الإنسان البالغ؟',
    'ما هو أكبر عضو في جسم الإنسان؟',
    'ما هي مدة الحمل الطبيعية؟',
    'ما هو عدد ضربات القلب الطبيعية في الدقيقة؟',
    'ما هو لون الدم في الأوردة؟',
  ],
  'الفن': [
    'من هو أشهر رسام في العالم؟',
    'ما هي لوحة الموناليزا؟',
    'من هو مؤسس المدرسة التكعيبية؟',
    'ما هي أكبر متحف في العالم؟',
    'من هو أشهر نحات عربي؟',
  ],
  'الفلسفة': [
    'من هو مؤسس الفلسفة الغربية؟',
    'ما هي أشهر مقولة لسقراط؟',
    'من هو فيلسوف "أنا أفكر إذن أنا موجود"؟',
    'ما هي الفلسفة الأخلاقية؟',
    'من هو أشهر فيلسوف عربي؟',
  ],
  'الاقتصاد': [
    'ما هي أكبر اقتصاد في العالم؟',
    'ما هو الناتج المحلي الإجمالي؟',
    'ما هي عملة اليورو؟',
    'ما هو التضخم؟',
    'ما هي أكبر شركة في العالم من حيث القيمة السوقية؟',
  ],
  'الفلك': [
    'ما هو أقرب نجم للأرض؟',
    'كم عدد الكواكب في المجموعة الشمسية؟',
    'ما هو أكبر كوكب؟',
    'ما هي المسافة بين الأرض والشمس؟',
    'ما هو الثقب الأسود؟',
  ],
};

// Generate diverse options
function generateOptions(correctAnswer: string, subject: string): any[] {
  const options = [
    { id: 'opt-0', text: correctAnswer, isCorrect: true },
    { id: 'opt-1', text: 'إجابة خاطئة 1', isCorrect: false },
    { id: 'opt-2', text: 'إجابة خاطئة 2', isCorrect: false },
    { id: 'opt-3', text: 'إجابة خاطئة 3', isCorrect: false },
  ];
  
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  return options;
}

// Generate questions for a subject and type
function generateQuestionsForType(subject: any, typeId: string, count: number): any[] {
  const questions: any[] = [];
  const templates = QUESTION_TEMPLATES[subject.nameAr] || [];
  const difficulties = ['easy', 'medium', 'hard'];
  
  for (let i = 1; i <= count; i++) {
    const difficulty = difficulties[Math.floor(Math.random() * 3)];
    const baseQuestion = templates[i % templates.length] || `سؤال ${i} في ${subject.nameAr}`;
    
    let question: any = {
      text: '',
      options: [],
      difficulty,
      points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20,
      timeLimit: QUESTION_TYPES.find(t => t.id === typeId)?.timeLimit || 30,
    };

    switch (typeId) {
      case 'multiple-choice':
        question.text = baseQuestion;
        question.options = generateOptions('الإجابة الصحيحة', subject.nameAr);
        break;
        
      case 'true-false':
        question.text = `${baseQuestion} - هل هذه العبارة صحيحة؟`;
        const isTrue = Math.random() > 0.5;
        question.options = [
          { id: 'opt-0', text: 'صح', isCorrect: isTrue },
          { id: 'opt-1', text: 'خطأ', isCorrect: !isTrue },
        ];
        break;
        
      case 'fill-blank':
        question.text = `${baseQuestion.replace('؟', '')} هو _____`;
        question.correctAnswer = 'الإجابة الصحيحة';
        break;
        
      default:
        question.text = baseQuestion;
        question.options = generateOptions('الإجابة الصحيحة', subject.nameAr);
    }
    
    questions.push(question);
  }
  
  return questions;
}

async function seedDatabase() {
  try {
    console.log('\n🌱 ===== STARTING DATABASE SEEDING =====\n');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    const deletedQuestions = await Question.deleteMany({});
    const deletedSubjects = await Subject.deleteMany({});
    console.log(`✅ Deleted ${deletedQuestions.deletedCount} questions and ${deletedSubjects.deletedCount} subjects\n`);
    
    // Create subjects
    console.log('📚 Creating 20 subjects...');
    const createdSubjects = [];
    for (const subj of SUBJECTS) {
      const subject = await Subject.create(subj);
      createdSubjects.push(subject);
      console.log(`  ✅ ${subject.nameAr} (${subject.name})`);
    }
    console.log(`\n✅ Created ${createdSubjects.length} subjects\n`);
    
    // Create questions
    console.log('📝 Creating questions (50 per type × 9 types = 450 per subject)...\n');
    let totalQuestions = 0;
    const startTime = Date.now();
    
    for (let sIdx = 0; sIdx < createdSubjects.length; sIdx++) {
      const subject = createdSubjects[sIdx];
      const progress = `[${sIdx + 1}/${createdSubjects.length}]`;
      
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`${progress} 📖 ${subject.nameAr}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      let subjectQuestionCount = 0;
      
      for (let tIdx = 0; tIdx < QUESTION_TYPES.length; tIdx++) {
        const qType = QUESTION_TYPES[tIdx];
        const typeProgress = `[${tIdx + 1}/${QUESTION_TYPES.length}]`;
        
        process.stdout.write(`  ${typeProgress} 📝 ${qType.nameAr}... `);
        
        const questions = generateQuestionsForType(subject, qType.id, 50);
        let saved = 0;
        
        for (const q of questions) {
          try {
            if (!q.text || (qType.id !== 'fill-blank' && (!q.options || q.options.length === 0))) {
              continue; // Skip invalid questions
            }
            
            await Question.create({
              text: q.text,
              subjectId: subject._id,
              questionTypeId: qType.id, // Now accepts string
              options: q.options || [],
              correctAnswer: q.correctAnswer,
              difficulty: q.difficulty,
              points: q.points,
              timeLimit: q.timeLimit,
            });
            saved++;
            subjectQuestionCount++;
            totalQuestions++;
          } catch (error: any) {
            if (saved === 0 && questions.indexOf(q) === 0) {
              // Log first error to debug
              console.error(`    ❌ Error: ${error.message}`);
            }
          }
        }
        
        console.log(`✅ ${saved}/50`);
      }
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const avgTime = (parseFloat(elapsed) / (sIdx + 1)).toFixed(1);
      const remaining = Math.ceil((parseFloat(avgTime) * (createdSubjects.length - sIdx - 1)) / 60);
      
      console.log(`\n  📊 ${subject.nameAr}: ${subjectQuestionCount} questions`);
      console.log(`  ⏱️  Elapsed: ${elapsed}s | Est. remaining: ~${remaining} min\n`);
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SEEDING COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Subjects: ${createdSubjects.length}`);
    console.log(`✅ Questions: ${totalQuestions.toLocaleString()}`);
    console.log(`📊 Average: ${Math.floor(totalQuestions / createdSubjects.length)} questions per subject`);
    console.log(`⏱️  Total time: ${totalTime}s (${(parseFloat(totalTime) / 60).toFixed(1)} min)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
