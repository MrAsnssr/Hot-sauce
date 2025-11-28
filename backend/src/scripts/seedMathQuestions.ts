import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';

dotenv.config();

const seedMathQuestions = async () => {
  try {
    await connectDatabase();

    // Find Math subject
    let mathSubject = await Subject.findOne({ name: 'Mathematics' });
    if (!mathSubject) {
      mathSubject = await Subject.create({
        name: 'Mathematics',
        nameAr: 'الرياضيات',
        description: 'أسئلة رياضية',
        color: '#ec4899'
      });
    }
    const subjectId = mathSubject._id;

    console.log('🌱 Adding Math Questions...');

    // ============ FILL IN THE BLANK QUESTIONS ============
    const fillBlankQuestions = [
      { text: "مجموع زوايا المثلث يساوي _____ درجة.", correctAnswer: "180", difficulty: "easy" },
      { text: "صيغة مساحة المستطيل هي الطول × _____.", correctAnswer: "العرض", difficulty: "easy" },
      { text: "في المعادلة 3x + 5 = 20، فإن قيمة x تساوي _____.", correctAnswer: "5", difficulty: "medium" },
      { text: "مشتق الدالة f(x) = x² هو _____.", correctAnswer: "2x", difficulty: "medium" },
      { text: "عدد π يساوي تقريباً _____.", correctAnswer: "3.14", difficulty: "easy" },
      { text: "في الدائرة، المحيط = 2 × π × _____.", correctAnswer: "نصف القطر", difficulty: "easy" },
      { text: "حاصل قسمة أي عدد على صفر هو _____.", correctAnswer: "غير معرف", difficulty: "easy" },
      { text: "إذا كان أ = ٢⁵، فإن أ تساوي _____.", correctAnswer: "32", difficulty: "easy" },
      { text: "معادلة الخط المستقيم هي y = mx + _____.", correctAnswer: "c", difficulty: "medium" },
      { text: "مجموع زوايا المضلع الرباعي يساوي _____ درجة.", correctAnswer: "360", difficulty: "easy" },
      { text: "مساحة المثلث = ½ × القاعدة × _____.", correctAnswer: "الارتفاع", difficulty: "easy" },
      { text: "sin(90°) = _____.", correctAnswer: "1", difficulty: "easy" },
      { text: "جذر ٤٩ هو _____.", correctAnswer: "7", difficulty: "easy" },
      { text: "٥! يساوي _____.", correctAnswer: "120", difficulty: "medium" },
      { text: "في المتتالية الحسابية، الفرق المشترك يرمز له بالحرف _____.", correctAnswer: "d", difficulty: "medium" },
      { text: "حجم المكعب = طول الحرف × طول الحرف × _____.", correctAnswer: "طول الحرف", difficulty: "easy" },
      { text: "cos(0°) = _____.", correctAnswer: "1", difficulty: "easy" },
      { text: "معكوس الضرب للعدد ٤ هو _____.", correctAnswer: "¼", difficulty: "medium" },
      { text: "مساحة الدائرة = π × _____².", correctAnswer: "نصف القطر", difficulty: "easy" },
      { text: "إذا كان sin θ = ½، فإن θ = _____ درجة (في الربع الأول).", correctAnswer: "30", difficulty: "medium" },
      { text: "العدد الأولي الذي يلي ١٩ هو _____.", correctAnswer: "23", difficulty: "easy" },
      { text: "قانون فيثاغورس: أ² + ب² = _____².", correctAnswer: "ج", difficulty: "easy" },
      { text: "مشتق دالة ثابتة يساوي _____.", correctAnswer: "صفر", difficulty: "easy" },
      { text: "عدد الأوجه في المكعب هو _____.", correctAnswer: "6", difficulty: "easy" },
      { text: "٢³ × ٢⁴ = _____.", correctAnswer: "٢⁷", difficulty: "medium" },
      { text: "tan(45°) = _____.", correctAnswer: "1", difficulty: "easy" },
      { text: "حجم الأسطوانة = π × نصف القطر² × _____.", correctAnswer: "الارتفاع", difficulty: "medium" },
      { text: "أصغر عدد أولي هو _____.", correctAnswer: "2", difficulty: "easy" },
      { text: "في المثلث المتساوي الساقين، الزاويتان القاعديتان _____.", correctAnswer: "متساويتان", difficulty: "easy" },
      { text: "log₁₀(100) = _____.", correctAnswer: "2", difficulty: "medium" },
      { text: "مجموع متتالية عددية من ١ إلى ١٠٠ هو _____.", correctAnswer: "5050", difficulty: "hard" },
      { text: "عدد الرؤوس في المكعب هو _____.", correctAnswer: "8", difficulty: "easy" },
      { text: "sin²θ + cos²θ = _____.", correctAnswer: "1", difficulty: "medium" },
      { text: "مساحة المعين = نصف حاصل ضرب _____.", correctAnswer: "القطرين", difficulty: "medium" },
      { text: "٧ + ٥ × ٤ - ٦ = _____ (باتباع ترتيب العمليات).", correctAnswer: "21", difficulty: "medium" },
      { text: "مشتق ln(x) هو _____.", correctAnswer: "1/x", difficulty: "hard" },
      { text: "عدد أضلاع الخماسي المنتظم هو _____.", correctAnswer: "5", difficulty: "easy" },
      { text: "١٢٥٪ = _____ كسر عشري.", correctAnswer: "1.25", difficulty: "easy" },
      { text: "أكبر قاسم مشترك لـ ٢٤ و ٣٦ هو _____.", correctAnswer: "12", difficulty: "medium" },
      { text: "حجم الكرة = ٤/٣ × π × _____³.", correctAnswer: "نصف القطر", difficulty: "hard" },
      { text: "tan θ = sin θ / _____.", correctAnswer: "cos θ", difficulty: "medium" },
      { text: "العدد ١ هو _____ في عملية الضرب.", correctAnswer: "العنصر المحايد", difficulty: "medium" },
      { text: "مساحة شبه المنحرف = ½ × (مجموع القاعدتين) × _____.", correctAnswer: "الارتفاع", difficulty: "medium" },
      { text: "٩٠ درجة = _____ راديان.", correctAnswer: "π/2", difficulty: "hard" },
      { text: "أصغر مضاعف مشترك لـ ٦ و ٨ هو _____.", correctAnswer: "24", difficulty: "medium" },
      { text: "مشتق الدالة e^x هو _____.", correctAnswer: "e^x", difficulty: "hard" },
      { text: "في المثلث القائم الزاوية، الوتر يكون أطول _____ في المثلث.", correctAnswer: "ضلع", difficulty: "easy" },
    ].map(q => ({
      text: q.text,
      subjectId,
      questionTypeId: 'fill-blank',
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
      points: q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20,
      timeLimit: 40,
    }));

    // ============ FOUR OPTIONS QUESTIONS ============
    const fourOptionsQuestions = [
      {
        text: "ما هو ناتج ٨ × ٧؟",
        options: [
          { id: "1", text: "54", isCorrect: false },
          { id: "2", text: "56", isCorrect: true },
          { id: "3", text: "58", isCorrect: false },
          { id: "4", text: "60", isCorrect: false },
        ],
        difficulty: "easy"
      },
      {
        text: "ما هي مساحة مربع طول ضلعه ٥ سم؟",
        options: [
          { id: "1", text: "15 سم²", isCorrect: false },
          { id: "2", text: "20 سم²", isCorrect: false },
          { id: "3", text: "25 سم²", isCorrect: true },
          { id: "4", text: "30 سم²", isCorrect: false },
        ],
        difficulty: "easy"
      },
      {
        text: "أي مما يلي عدد أولي؟",
        options: [
          { id: "1", text: "51", isCorrect: false },
          { id: "2", text: "53", isCorrect: true },
          { id: "3", text: "55", isCorrect: false },
          { id: "4", text: "57", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "sin(30°) يساوي:",
        options: [
          { id: "1", text: "½", isCorrect: true },
          { id: "2", text: "√2/2", isCorrect: false },
          { id: "3", text: "√3/2", isCorrect: false },
          { id: "4", text: "1", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "ما هو مشتق x³؟",
        options: [
          { id: "1", text: "3x", isCorrect: false },
          { id: "2", text: "3x²", isCorrect: true },
          { id: "3", text: "x²", isCorrect: false },
          { id: "4", text: "3x⁴", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "مجموع زوايا الخماسي المنتظم:",
        options: [
          { id: "1", text: "540°", isCorrect: true },
          { id: "2", text: "360°", isCorrect: false },
          { id: "3", text: "720°", isCorrect: false },
          { id: "4", text: "900°", isCorrect: false },
        ],
        difficulty: "hard"
      },
      {
        text: "إذا كان ٢ˣ = ٣٢، فإن x =",
        options: [
          { id: "1", text: "4", isCorrect: false },
          { id: "2", text: "5", isCorrect: true },
          { id: "3", text: "6", isCorrect: false },
          { id: "4", text: "7", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "حجم المكعب طول حرفه ٣ سم هو:",
        options: [
          { id: "1", text: "9 سم³", isCorrect: false },
          { id: "2", text: "18 سم³", isCorrect: false },
          { id: "3", text: "27 سم³", isCorrect: true },
          { id: "4", text: "36 سم³", isCorrect: false },
        ],
        difficulty: "easy"
      },
      {
        text: "tan(60°) =",
        options: [
          { id: "1", text: "1", isCorrect: false },
          { id: "2", text: "√3", isCorrect: true },
          { id: "3", text: "√2", isCorrect: false },
          { id: "4", text: "½", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "عدد الأعداد الأولية أقل من ٢٠ هو:",
        options: [
          { id: "1", text: "6", isCorrect: false },
          { id: "2", text: "7", isCorrect: false },
          { id: "3", text: "8", isCorrect: true },
          { id: "4", text: "9", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "أي معادلة تمثل دائرة مركزها الأصل ونصف قطرها ٤؟",
        options: [
          { id: "1", text: "x² + y² = 4", isCorrect: false },
          { id: "2", text: "x² + y² = 16", isCorrect: true },
          { id: "3", text: "x² + y² = 8", isCorrect: false },
          { id: "4", text: "x² + y² = 20", isCorrect: false },
        ],
        difficulty: "hard"
      },
      {
        text: "٦! يساوي:",
        options: [
          { id: "1", text: "720", isCorrect: true },
          { id: "2", text: "120", isCorrect: false },
          { id: "3", text: "360", isCorrect: false },
          { id: "4", text: "480", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "log₂(16) =",
        options: [
          { id: "1", text: "2", isCorrect: false },
          { id: "2", text: "3", isCorrect: false },
          { id: "3", text: "4", isCorrect: true },
          { id: "4", text: "5", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "أي زاوية تكون مكملة لـ ٤٥°؟",
        options: [
          { id: "1", text: "45°", isCorrect: false },
          { id: "2", text: "90°", isCorrect: false },
          { id: "3", text: "135°", isCorrect: true },
          { id: "4", text: "180°", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "ناتج √(64) =",
        options: [
          { id: "1", text: "6", isCorrect: false },
          { id: "2", text: "7", isCorrect: false },
          { id: "3", text: "8", isCorrect: true },
          { id: "4", text: "9", isCorrect: false },
        ],
        difficulty: "easy"
      },
      {
        text: "مساحة مثلث قاعدته ١٠ سم وارتفاعه ٨ سم:",
        options: [
          { id: "1", text: "40 سم²", isCorrect: true },
          { id: "2", text: "80 سم²", isCorrect: false },
          { id: "3", text: "18 سم²", isCorrect: false },
          { id: "4", text: "90 سم²", isCorrect: false },
        ],
        difficulty: "easy"
      },
      {
        text: "أي دالة زوجية؟",
        options: [
          { id: "1", text: "x³", isCorrect: false },
          { id: "2", text: "x²", isCorrect: true },
          { id: "3", text: "1/x", isCorrect: false },
          { id: "4", text: "√x", isCorrect: false },
        ],
        difficulty: "hard"
      },
      {
        text: "٢⁵ =",
        options: [
          { id: "1", text: "16", isCorrect: false },
          { id: "2", text: "32", isCorrect: true },
          { id: "3", text: "64", isCorrect: false },
          { id: "4", text: "128", isCorrect: false },
        ],
        difficulty: "easy"
      },
      {
        text: "عدد حلول المعادلة x² - ٥x + ٦ = ٠ هو:",
        options: [
          { id: "1", text: "0", isCorrect: false },
          { id: "2", text: "1", isCorrect: false },
          { id: "3", text: "2", isCorrect: true },
          { id: "4", text: "3", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "أكبر عدد أولي أقل من ٥٠ هو:",
        options: [
          { id: "1", text: "43", isCorrect: false },
          { id: "2", text: "47", isCorrect: true },
          { id: "3", text: "49", isCorrect: false },
          { id: "4", text: "41", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "cos(60°) =",
        options: [
          { id: "1", text: "½", isCorrect: true },
          { id: "2", text: "√3/2", isCorrect: false },
          { id: "3", text: "1", isCorrect: false },
          { id: "4", text: "0", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "مجموع أول ١٠ أعداد طبيعية هو:",
        options: [
          { id: "1", text: "45", isCorrect: false },
          { id: "2", text: "55", isCorrect: true },
          { id: "3", text: "50", isCorrect: false },
          { id: "4", text: "60", isCorrect: false },
        ],
        difficulty: "medium"
      },
      {
        text: "١٥٪ من ٢٠٠ هو:",
        options: [
          { id: "1", text: "20", isCorrect: false },
          { id: "2", text: "25", isCorrect: false },
          { id: "3", text: "30", isCorrect: true },
          { id: "4", text: "35", isCorrect: false },
        ],
        difficulty: "easy"
      },
      {
        text: "مشتق sin(x) هو:",
        options: [
          { id: "1", text: "cos(x)", isCorrect: true },
          { id: "2", text: "-cos(x)", isCorrect: false },
          { id: "3", text: "sin(x)", isCorrect: false },
          { id: "4", text: "-sin(x)", isCorrect: false },
        ],
        difficulty: "hard"
      },
      {
        text: "عدد أضلاع المكعب:",
        options: [
          { id: "1", text: "6", isCorrect: false },
          { id: "2", text: "8", isCorrect: false },
          { id: "3", text: "12", isCorrect: true },
          { id: "4", text: "10", isCorrect: false },
        ],
        difficulty: "easy"
      },
    ].map(q => ({
      text: q.text,
      subjectId,
      questionTypeId: 'four-options',
      options: q.options,
      difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
      points: q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20,
      timeLimit: 30,
    }));

    // ============ ORDER CHALLENGE QUESTIONS ============
    const orderQuestions = [
      {
        text: "رتب العلماء حسب ميلادهم:",
        orderItems: [
          { id: "1", text: "فيثاغورس", correctPosition: 1 },
          { id: "2", text: "إقليدس", correctPosition: 2 },
          { id: "3", text: "أرخميدس", correctPosition: 3 },
          { id: "4", text: "ديكارت", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب ظهور الأعداد:",
        orderItems: [
          { id: "1", text: "الصفر", correctPosition: 1 },
          { id: "2", text: "الأعداد السالبة", correctPosition: 2 },
          { id: "3", text: "الأعداد المركبة", correctPosition: 3 },
          { id: "4", text: "الأعداد الفائقة", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب العلماء حسب ميلادهم:",
        orderItems: [
          { id: "1", text: "نيوتن", correctPosition: 1 },
          { id: "2", text: "لايبنتز", correctPosition: 2 },
          { id: "3", text: "أويلر", correctPosition: 3 },
          { id: "4", text: "غاوس", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الاكتشافات الرياضية:",
        orderItems: [
          { id: "1", text: "مبرهنة فيثاغورس", correctPosition: 1 },
          { id: "2", text: "نظرية طاليس", correctPosition: 2 },
          { id: "3", text: "حساب المثلثات", correctPosition: 3 },
          { id: "4", text: "قانون أرخميدس", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب ظهور الفروع الرياضية:",
        orderItems: [
          { id: "1", text: "التفاضل والتكامل", correctPosition: 1 },
          { id: "2", text: "الهندسة التحليلية", correctPosition: 2 },
          { id: "3", text: "نظرية الأعداد (غاوس)", correctPosition: 3 },
          { id: "4", text: "نظرية المجموعات (كانتور)", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب العلماء:",
        orderItems: [
          { id: "1", text: "فيرمات", correctPosition: 1 },
          { id: "2", text: "ديكارت", correctPosition: 2 },
          { id: "3", text: "باسكال", correctPosition: 3 },
          { id: "4", text: "نيوتن", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب ظهور المفاهيم:",
        orderItems: [
          { id: "1", text: "المتجهات", correctPosition: 1 },
          { id: "2", text: "المحددات", correctPosition: 2 },
          { id: "3", text: "المصفوفات", correctPosition: 3 },
          { id: "4", text: "الفضاءات المتجهية", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب العلماء:",
        orderItems: [
          { id: "1", text: "كوشي", correctPosition: 1 },
          { id: "2", text: "أبيل", correctPosition: 2 },
          { id: "3", text: "غالوا", correctPosition: 3 },
          { id: "4", text: "ريمان", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب العلماء:",
        orderItems: [
          { id: "1", text: "هيلبرت", correctPosition: 1 },
          { id: "2", text: "غودل", correctPosition: 2 },
          { id: "3", text: "فون نويمان", correctPosition: 3 },
          { id: "4", text: "تورينغ", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الإنجازات:",
        orderItems: [
          { id: "1", text: "برنامج هيلبرت", correctPosition: 1 },
          { id: "2", text: "مبرهنة عدم الاكتمال", correctPosition: 2 },
          { id: "3", text: "نظرية الألعاب", correctPosition: 3 },
          { id: "4", text: "آلة تورينغ", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب ظهور الفروع:",
        orderItems: [
          { id: "1", text: "نظرية الاحتمالات", correctPosition: 1 },
          { id: "2", text: "الطوبولوجيا", correctPosition: 2 },
          { id: "3", text: "نظرية القياس", correctPosition: 3 },
          { id: "4", text: "التحليل الدالي", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب ظهور تقنيات التشفير:",
        orderItems: [
          { id: "1", text: "الخوارزميات", correctPosition: 1 },
          { id: "2", text: "التشفير", correctPosition: 2 },
          { id: "3", text: "نظرية التعقيد", correctPosition: 3 },
          { id: "4", text: "P vs NP", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب تطور الذكاء الاصطناعي:",
        orderItems: [
          { id: "1", text: "الذكاء الاصطناعي", correctPosition: 1 },
          { id: "2", text: "التعلم الآلي", correctPosition: 2 },
          { id: "3", text: "الشبكات العصبية", correctPosition: 3 },
          { id: "4", text: "التعلم العميق", correctPosition: 4 },
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الإنجازات:",
        orderItems: [
          { id: "1", text: "التراجع العكسي", correctPosition: 1 },
          { id: "2", text: "الشبكات الالتفافية", correctPosition: 2 },
          { id: "3", text: "الشبكات العصبية المتكررة", correctPosition: 3 },
          { id: "4", text: "التعلم المعزز", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
      {
        text: "رتب ظهور نماذج الذكاء الاصطناعي:",
        orderItems: [
          { id: "1", text: "ألفا غو", correctPosition: 1 },
          { id: "2", text: "ألفا زيرو", correctPosition: 2 },
          { id: "3", text: "ألفا ستار", correctPosition: 3 },
          { id: "4", text: "ألفا فولد", correctPosition: 4 },
        ],
        difficulty: "hard"
      },
    ].map(q => ({
      text: q.text,
      subjectId,
      questionTypeId: 'order-challenge',
      orderItems: q.orderItems,
      difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
      points: q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20,
      timeLimit: 45,
    }));

    // ============ WHO AND WHO QUESTIONS ============
    const whoAndWhoQuestions = [
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "فيثاغورس" },
            { id: "p2", name: "إقليدس" },
          ],
          achievements: [
            { id: "a1", text: "نظرية فيثاغورس", personId: "p1" },
            { id: "a2", text: "كتاب الأصول", personId: "p2" },
          ],
        },
        difficulty: "easy"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "نيوتن" },
            { id: "p2", name: "لايبنتز" },
          ],
          achievements: [
            { id: "a1", text: "قانون الجذب الكوني", personId: "p1" },
            { id: "a2", text: "التفاضل والتكامل", personId: "p2" },
          ],
        },
        difficulty: "medium"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "غاوس" },
            { id: "p2", name: "ريمان" },
          ],
          achievements: [
            { id: "a1", text: "توزيع الأعداد الأولية", personId: "p1" },
            { id: "a2", text: "حدسية ريمان", personId: "p2" },
          ],
        },
        difficulty: "hard"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "ديكارت" },
            { id: "p2", name: "فيرمات" },
          ],
          achievements: [
            { id: "a1", text: "الإحداثيات الديكارتية", personId: "p1" },
            { id: "a2", text: "نظرية فيرمات الأخيرة", personId: "p2" },
          ],
        },
        difficulty: "medium"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "أويلر" },
            { id: "p2", name: "برنولي" },
          ],
          achievements: [
            { id: "a1", text: "ثابت أويلر e", personId: "p1" },
            { id: "a2", text: "أعداد برنولي", personId: "p2" },
          ],
        },
        difficulty: "hard"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "كانتور" },
            { id: "p2", name: "ديدكيند" },
          ],
          achievements: [
            { id: "a1", text: "نظرية المجموعات", personId: "p1" },
            { id: "a2", text: "قطع ديدكيند", personId: "p2" },
          ],
        },
        difficulty: "hard"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "هيلبرت" },
            { id: "p2", name: "غودل" },
          ],
          achievements: [
            { id: "a1", text: "مشكلات هيلبرت", personId: "p1" },
            { id: "a2", text: "مبرهنة عدم الاكتمال", personId: "p2" },
          ],
        },
        difficulty: "hard"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "تورينغ" },
            { id: "p2", name: "فون نويمان" },
          ],
          achievements: [
            { id: "a1", text: "آلة تورينغ", personId: "p1" },
            { id: "a2", text: "معمارية فون نويمان", personId: "p2" },
          ],
        },
        difficulty: "medium"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "بوانكاريه" },
            { id: "p2", name: "بيرلمان" },
          ],
          achievements: [
            { id: "a1", text: "حدسية بوانكاريه", personId: "p1" },
            { id: "a2", text: "برهان حدسية بوانكاريه", personId: "p2" },
          ],
        },
        difficulty: "hard"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "ناش" },
            { id: "p2", name: "فون نويمان" },
          ],
          achievements: [
            { id: "a1", text: "توازن ناش", personId: "p1" },
            { id: "a2", text: "نظرية الألعاب", personId: "p2" },
          ],
        },
        difficulty: "medium"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "هينتون" },
            { id: "p2", name: "لكون" },
          ],
          achievements: [
            { id: "a1", text: "التراجع العكسي", personId: "p1" },
            { id: "a2", text: "الشبكات الالتفافية", personId: "p2" },
          ],
        },
        difficulty: "hard"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "أرخميدس" },
            { id: "p2", name: "طاليس" },
          ],
          achievements: [
            { id: "a1", text: "مبدأ الطفو", personId: "p1" },
            { id: "a2", text: "مبرهنة طاليس", personId: "p2" },
          ],
        },
        difficulty: "medium"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "باسكال" },
            { id: "p2", name: "نيوتن" },
          ],
          achievements: [
            { id: "a1", text: "مثلث باسكال", personId: "p1" },
            { id: "a2", text: "متسلسلة نيوتن الثنائية", personId: "p2" },
          ],
        },
        difficulty: "medium"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "فورييه" },
            { id: "p2", name: "ديريشليه" },
          ],
          achievements: [
            { id: "a1", text: "تحليل فورييه", personId: "p1" },
            { id: "a2", text: "شروط ديريشليه", personId: "p2" },
          ],
        },
        difficulty: "hard"
      },
      {
        text: "وصّل كل عالم بإنجازه:",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "شرودنغر" },
            { id: "p2", name: "هايزنبرغ" },
          ],
          achievements: [
            { id: "a1", text: "معادلة شرودنغر", personId: "p1" },
            { id: "a2", text: "مبدأ عدم التأكد", personId: "p2" },
          ],
        },
        difficulty: "hard"
      },
    ].map(q => ({
      text: q.text,
      subjectId,
      questionTypeId: 'who-and-who',
      whoAndWhoData: q.whoAndWhoData,
      difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
      points: q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20,
      timeLimit: 50,
    }));

    // Insert all questions
    const allQuestions = [
      ...fillBlankQuestions,
      ...fourOptionsQuestions,
      ...orderQuestions,
      ...whoAndWhoQuestions,
    ];

    await Question.insertMany(allQuestions);

    console.log(`✅ تم إضافة ${allQuestions.length} سؤال رياضيات بنجاح!`);
    console.log(`   - ${fillBlankQuestions.length} أسئلة املأ الفراغ`);
    console.log(`   - ${fourOptionsQuestions.length} أسئلة اختيار من 4`);
    console.log(`   - ${orderQuestions.length} أسئلة ترتيب`);
    console.log(`   - ${whoAndWhoQuestions.length} أسئلة من ومن`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

seedMathQuestions();

