import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';

dotenv.config();

const seedMathPart2 = async () => {
  try {
    await connectDatabase();
    let mathSubject = await Subject.findOne({ name: 'Math' });
    if (!mathSubject) {
      mathSubject = await Subject.create({ name: 'Math', nameAr: 'الرياضيات', description: 'أسئلة رياضية', color: '#3b82f6' });
    }
    const subjectId = mathSubject._id;

    console.log('🌱 Adding Math Questions Part 2...');

    // More Four Options Questions (26-50)
    const fourOptionsQuestions = [
      { text: "ما هو الجذر التربيعي لـ 144؟", options: [{ id: "1", text: "10", isCorrect: false }, { id: "2", text: "12", isCorrect: true }, { id: "3", text: "14", isCorrect: false }, { id: "4", text: "16", isCorrect: false }], difficulty: "easy" },
      { text: "ما هو ناتج 15² ؟", options: [{ id: "1", text: "200", isCorrect: false }, { id: "2", text: "225", isCorrect: true }, { id: "3", text: "250", isCorrect: false }, { id: "4", text: "275", isCorrect: false }], difficulty: "easy" },
      { text: "ما هو 25% من 400؟", options: [{ id: "1", text: "80", isCorrect: false }, { id: "2", text: "100", isCorrect: true }, { id: "3", text: "120", isCorrect: false }, { id: "4", text: "150", isCorrect: false }], difficulty: "easy" },
      { text: "ما هو المضاعف المشترك الأصغر لـ 6 و 8؟", options: [{ id: "1", text: "12", isCorrect: false }, { id: "2", text: "24", isCorrect: true }, { id: "3", text: "48", isCorrect: false }, { id: "4", text: "36", isCorrect: false }], difficulty: "medium" },
      { text: "ما هو ناتج 3⁴؟", options: [{ id: "1", text: "27", isCorrect: false }, { id: "2", text: "81", isCorrect: true }, { id: "3", text: "64", isCorrect: false }, { id: "4", text: "243", isCorrect: false }], difficulty: "medium" },
      { text: "ما هي قيمة π تقريباً؟", options: [{ id: "1", text: "3.14", isCorrect: true }, { id: "2", text: "2.14", isCorrect: false }, { id: "3", text: "4.14", isCorrect: false }, { id: "4", text: "3.41", isCorrect: false }], difficulty: "easy" },
      { text: "ما هو ناتج log₁₀(1000)؟", options: [{ id: "1", text: "2", isCorrect: false }, { id: "2", text: "3", isCorrect: true }, { id: "3", text: "4", isCorrect: false }, { id: "4", text: "10", isCorrect: false }], difficulty: "medium" },
      { text: "ما هي مساحة مربع ضلعه 7 سم؟", options: [{ id: "1", text: "28 سم²", isCorrect: false }, { id: "2", text: "49 سم²", isCorrect: true }, { id: "3", text: "14 سم²", isCorrect: false }, { id: "4", text: "21 سم²", isCorrect: false }], difficulty: "easy" },
      { text: "ما هو محيط دائرة قطرها 10 سم؟", options: [{ id: "1", text: "31.4 سم", isCorrect: true }, { id: "2", text: "314 سم", isCorrect: false }, { id: "3", text: "62.8 سم", isCorrect: false }, { id: "4", text: "15.7 سم", isCorrect: false }], difficulty: "medium" },
      { text: "ما هو ناتج |-7|؟", options: [{ id: "1", text: "-7", isCorrect: false }, { id: "2", text: "7", isCorrect: true }, { id: "3", text: "0", isCorrect: false }, { id: "4", text: "1", isCorrect: false }], difficulty: "easy" },
      { text: "ما هو ناتج 2⁰؟", options: [{ id: "1", text: "0", isCorrect: false }, { id: "2", text: "1", isCorrect: true }, { id: "3", text: "2", isCorrect: false }, { id: "4", text: "غير معرف", isCorrect: false }], difficulty: "easy" },
      { text: "ما هو حجم مكعب ضلعه 5 سم؟", options: [{ id: "1", text: "25 سم³", isCorrect: false }, { id: "2", text: "125 سم³", isCorrect: true }, { id: "3", text: "75 سم³", isCorrect: false }, { id: "4", text: "150 سم³", isCorrect: false }], difficulty: "medium" },
      { text: "ما هو sin(90°)؟", options: [{ id: "1", text: "0", isCorrect: false }, { id: "2", text: "1", isCorrect: true }, { id: "3", text: "-1", isCorrect: false }, { id: "4", text: "0.5", isCorrect: false }], difficulty: "medium" },
      { text: "ما هو cos(0°)؟", options: [{ id: "1", text: "0", isCorrect: false }, { id: "2", text: "1", isCorrect: true }, { id: "3", text: "-1", isCorrect: false }, { id: "4", text: "0.5", isCorrect: false }], difficulty: "medium" },
      { text: "ما هو ناتج 5! (مضروب 5)؟", options: [{ id: "1", text: "100", isCorrect: false }, { id: "2", text: "120", isCorrect: true }, { id: "3", text: "60", isCorrect: false }, { id: "4", text: "25", isCorrect: false }], difficulty: "medium" },
      { text: "ما هو العدد الأولي بين هذه الأرقام؟", options: [{ id: "1", text: "9", isCorrect: false }, { id: "2", text: "11", isCorrect: true }, { id: "3", text: "15", isCorrect: false }, { id: "4", text: "21", isCorrect: false }], difficulty: "easy" },
      { text: "ما هو ناتج √(64)؟", options: [{ id: "1", text: "6", isCorrect: false }, { id: "2", text: "8", isCorrect: true }, { id: "3", text: "7", isCorrect: false }, { id: "4", text: "9", isCorrect: false }], difficulty: "easy" },
      { text: "ما هو العامل المشترك الأكبر لـ 24 و 36؟", options: [{ id: "1", text: "6", isCorrect: false }, { id: "2", text: "12", isCorrect: true }, { id: "3", text: "8", isCorrect: false }, { id: "4", text: "4", isCorrect: false }], difficulty: "medium" },
      { text: "ما هو ناتج 7 × 8؟", options: [{ id: "1", text: "54", isCorrect: false }, { id: "2", text: "56", isCorrect: true }, { id: "3", text: "58", isCorrect: false }, { id: "4", text: "52", isCorrect: false }], difficulty: "easy" },
      { text: "ما هي قيمة tan(45°)؟", options: [{ id: "1", text: "0", isCorrect: false }, { id: "2", text: "1", isCorrect: true }, { id: "3", text: "√2", isCorrect: false }, { id: "4", text: "2", isCorrect: false }], difficulty: "medium" },
      { text: "ما هو ناتج (-3) × (-4)؟", options: [{ id: "1", text: "-12", isCorrect: false }, { id: "2", text: "12", isCorrect: true }, { id: "3", text: "-7", isCorrect: false }, { id: "4", text: "7", isCorrect: false }], difficulty: "easy" },
      { text: "ما هي مساحة دائرة نصف قطرها 5 سم؟", options: [{ id: "1", text: "25π سم²", isCorrect: true }, { id: "2", text: "10π سم²", isCorrect: false }, { id: "3", text: "5π سم²", isCorrect: false }, { id: "4", text: "50π سم²", isCorrect: false }], difficulty: "medium" },
      { text: "ما هو ناتج 1000 ÷ 25؟", options: [{ id: "1", text: "40", isCorrect: true }, { id: "2", text: "45", isCorrect: false }, { id: "3", text: "35", isCorrect: false }, { id: "4", text: "50", isCorrect: false }], difficulty: "easy" },
      { text: "ما هو المتوسط الحسابي لـ 10, 20, 30؟", options: [{ id: "1", text: "15", isCorrect: false }, { id: "2", text: "20", isCorrect: true }, { id: "3", text: "25", isCorrect: false }, { id: "4", text: "30", isCorrect: false }], difficulty: "easy" },
      { text: "ما هو ناتج (2+3)²؟", options: [{ id: "1", text: "10", isCorrect: false }, { id: "2", text: "25", isCorrect: true }, { id: "3", text: "13", isCorrect: false }, { id: "4", text: "20", isCorrect: false }], difficulty: "easy" },
    ].map(q => ({ text: q.text, subjectId, questionTypeId: 'four-options', options: q.options, difficulty: q.difficulty as 'easy' | 'medium' | 'hard', points: q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20, timeLimit: 30 }));

    // More Order Questions (16-35)
    const orderQuestions = [
      { text: "رتب من الأصغر للأكبر: 1/4, 1/3, 1/2, 2/3", orderItems: [{ id: "1", text: "1/4", correctPosition: 1 }, { id: "2", text: "1/3", correctPosition: 2 }, { id: "3", text: "1/2", correctPosition: 3 }, { id: "4", text: "2/3", correctPosition: 4 }], difficulty: "easy" },
      { text: "رتب من الأصغر للأكبر: √4, √9, √16, √25", orderItems: [{ id: "1", text: "√4 = 2", correctPosition: 1 }, { id: "2", text: "√9 = 3", correctPosition: 2 }, { id: "3", text: "√16 = 4", correctPosition: 3 }, { id: "4", text: "√25 = 5", correctPosition: 4 }], difficulty: "easy" },
      { text: "رتب العمليات: الأقواس، الأسس، الضرب/القسمة، الجمع/الطرح", orderItems: [{ id: "1", text: "الأقواس", correctPosition: 1 }, { id: "2", text: "الأسس", correctPosition: 2 }, { id: "3", text: "الضرب والقسمة", correctPosition: 3 }, { id: "4", text: "الجمع والطرح", correctPosition: 4 }], difficulty: "medium" },
      { text: "رتب النسب: 10%, 25%, 50%, 75%", orderItems: [{ id: "1", text: "10%", correctPosition: 1 }, { id: "2", text: "25%", correctPosition: 2 }, { id: "3", text: "50%", correctPosition: 3 }, { id: "4", text: "75%", correctPosition: 4 }], difficulty: "easy" },
      { text: "رتب الأعداد: -5, -2, 0, 3", orderItems: [{ id: "1", text: "-5", correctPosition: 1 }, { id: "2", text: "-2", correctPosition: 2 }, { id: "3", text: "0", correctPosition: 3 }, { id: "4", text: "3", correctPosition: 4 }], difficulty: "easy" },
      { text: "رتب القوى: 2¹, 2², 2³, 2⁴", orderItems: [{ id: "1", text: "2¹ = 2", correctPosition: 1 }, { id: "2", text: "2² = 4", correctPosition: 2 }, { id: "3", text: "2³ = 8", correctPosition: 3 }, { id: "4", text: "2⁴ = 16", correctPosition: 4 }], difficulty: "easy" },
      { text: "رتب الكسور العشرية: 0.1, 0.25, 0.5, 0.75", orderItems: [{ id: "1", text: "0.1", correctPosition: 1 }, { id: "2", text: "0.25", correctPosition: 2 }, { id: "3", text: "0.5", correctPosition: 3 }, { id: "4", text: "0.75", correctPosition: 4 }], difficulty: "easy" },
      { text: "رتب المضلعات حسب عدد الأضلاع: مثلث، مربع، خماسي، سداسي", orderItems: [{ id: "1", text: "مثلث (3)", correctPosition: 1 }, { id: "2", text: "مربع (4)", correctPosition: 2 }, { id: "3", text: "خماسي (5)", correctPosition: 3 }, { id: "4", text: "سداسي (6)", correctPosition: 4 }], difficulty: "easy" },
      { text: "رتب وحدات الطول: مم، سم، م، كم", orderItems: [{ id: "1", text: "مليمتر", correctPosition: 1 }, { id: "2", text: "سنتيمتر", correctPosition: 2 }, { id: "3", text: "متر", correctPosition: 3 }, { id: "4", text: "كيلومتر", correctPosition: 4 }], difficulty: "easy" },
      { text: "رتب الأعداد الأولية: 2, 3, 5, 7", orderItems: [{ id: "1", text: "2", correctPosition: 1 }, { id: "2", text: "3", correctPosition: 2 }, { id: "3", text: "5", correctPosition: 3 }, { id: "4", text: "7", correctPosition: 4 }], difficulty: "easy" },
      { text: "رتب زوايا المثلث: حادة، قائمة، منفرجة، مستقيمة", orderItems: [{ id: "1", text: "حادة < 90°", correctPosition: 1 }, { id: "2", text: "قائمة = 90°", correctPosition: 2 }, { id: "3", text: "منفرجة > 90°", correctPosition: 3 }, { id: "4", text: "مستقيمة = 180°", correctPosition: 4 }], difficulty: "medium" },
      { text: "رتب مقاييس الحجم: مل، لتر، متر مكعب، كم مكعب", orderItems: [{ id: "1", text: "مليلتر", correctPosition: 1 }, { id: "2", text: "لتر", correctPosition: 2 }, { id: "3", text: "متر مكعب", correctPosition: 3 }, { id: "4", text: "كيلومتر مكعب", correctPosition: 4 }], difficulty: "medium" },
      { text: "رتب خطوات حل المعادلة: تبسيط، جمع المتشابهات، عزل المتغير، التحقق", orderItems: [{ id: "1", text: "تبسيط الطرفين", correctPosition: 1 }, { id: "2", text: "جمع الحدود المتشابهة", correctPosition: 2 }, { id: "3", text: "عزل المتغير", correctPosition: 3 }, { id: "4", text: "التحقق من الحل", correctPosition: 4 }], difficulty: "medium" },
      { text: "رتب أنظمة العد: ثنائي، ثماني، عشري، ستعشري", orderItems: [{ id: "1", text: "ثنائي (2)", correctPosition: 1 }, { id: "2", text: "ثماني (8)", correctPosition: 2 }, { id: "3", text: "عشري (10)", correctPosition: 3 }, { id: "4", text: "ستعشري (16)", correctPosition: 4 }], difficulty: "hard" },
      { text: "رتب المتتالية: 1, 1, 2, 3, 5, 8", orderItems: [{ id: "1", text: "1 (الأول)", correctPosition: 1 }, { id: "2", text: "2 (الثالث)", correctPosition: 2 }, { id: "3", text: "5 (الخامس)", correctPosition: 3 }, { id: "4", text: "8 (السادس)", correctPosition: 4 }], difficulty: "medium" },
      { text: "رتب درجات كثيرة الحدود: ثابت، خطي، تربيعي، تكعيبي", orderItems: [{ id: "1", text: "ثابت (درجة 0)", correctPosition: 1 }, { id: "2", text: "خطي (درجة 1)", correctPosition: 2 }, { id: "3", text: "تربيعي (درجة 2)", correctPosition: 3 }, { id: "4", text: "تكعيبي (درجة 3)", correctPosition: 4 }], difficulty: "medium" },
      { text: "رتب قيم sin: sin(0°), sin(30°), sin(60°), sin(90°)", orderItems: [{ id: "1", text: "sin(0°) = 0", correctPosition: 1 }, { id: "2", text: "sin(30°) = 0.5", correctPosition: 2 }, { id: "3", text: "sin(60°) = √3/2", correctPosition: 3 }, { id: "4", text: "sin(90°) = 1", correctPosition: 4 }], difficulty: "hard" },
      { text: "رتب الأعداد: e, π, 3, 4", orderItems: [{ id: "1", text: "e ≈ 2.718", correctPosition: 1 }, { id: "2", text: "3", correctPosition: 2 }, { id: "3", text: "π ≈ 3.14", correctPosition: 3 }, { id: "4", text: "4", correctPosition: 4 }], difficulty: "hard" },
      { text: "رتب المجموعات العددية: طبيعية، صحيحة، نسبية، حقيقية", orderItems: [{ id: "1", text: "طبيعية N", correctPosition: 1 }, { id: "2", text: "صحيحة Z", correctPosition: 2 }, { id: "3", text: "نسبية Q", correctPosition: 3 }, { id: "4", text: "حقيقية R", correctPosition: 4 }], difficulty: "hard" },
      { text: "رتب اللوغاريتمات: log(1), log(10), log(100), log(1000)", orderItems: [{ id: "1", text: "log(1) = 0", correctPosition: 1 }, { id: "2", text: "log(10) = 1", correctPosition: 2 }, { id: "3", text: "log(100) = 2", correctPosition: 3 }, { id: "4", text: "log(1000) = 3", correctPosition: 4 }], difficulty: "medium" },
    ].map(q => ({ text: q.text, subjectId, questionTypeId: 'order-challenge', orderItems: q.orderItems, difficulty: q.difficulty as 'easy' | 'medium' | 'hard', points: q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20, timeLimit: 45 }));

    // More Who and Who Questions
    const whoAndWhoQuestions = [
      { text: "وصّل العالم بإنجازه:", whoAndWhoData: { people: [{ id: "p1", name: "ليونهارد أويلر" }, { id: "p2", name: "كارل غاوس" }], achievements: [{ id: "a1", text: "صيغة أويلر للأعداد المركبة", personId: "p1" }, { id: "a2", text: "قانون التوزيع الطبيعي", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل العالم بإنجازه:", whoAndWhoData: { people: [{ id: "p1", name: "جورج كانتور" }, { id: "p2", name: "جورج بول" }], achievements: [{ id: "a1", text: "نظرية المجموعات", personId: "p1" }, { id: "a2", text: "الجبر البولياني", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل العالم بإنجازه:", whoAndWhoData: { people: [{ id: "p1", name: "بليز باسكال" }, { id: "p2", name: "بيير دو فيرما" }], achievements: [{ id: "a1", text: "مثلث باسكال", personId: "p1" }, { id: "a2", text: "نظرية فيرما الأخيرة", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل العالم بإنجازه:", whoAndWhoData: { people: [{ id: "p1", name: "آلان تورينج" }, { id: "p2", name: "جون فون نيومان" }], achievements: [{ id: "a1", text: "آلة تورينج", personId: "p1" }, { id: "a2", text: "بنية الحاسوب", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل العالم بإنجازه:", whoAndWhoData: { people: [{ id: "p1", name: "برنارد ريمان" }, { id: "p2", name: "هنري بوانكاريه" }], achievements: [{ id: "a1", text: "هندسة ريمان", personId: "p1" }, { id: "a2", text: "حدسية بوانكاريه", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "جاليليو" }, { id: "p2", name: "كيبلر" }], achievements: [{ id: "a1", text: "سقوط الأجسام", personId: "p1" }, { id: "a2", text: "قوانين حركة الكواكب", personId: "p2" }] }, difficulty: "medium" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "رينيه ديكارت" }, { id: "p2", name: "فرانسوا فييت" }], achievements: [{ id: "a1", text: "نظام الإحداثيات", personId: "p1" }, { id: "a2", text: "الجبر الرمزي", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "برنهارد ريمان" }, { id: "p2", name: "نيكولاي لوباتشيفسكي" }], achievements: [{ id: "a1", text: "هندسة ريمانية", personId: "p1" }, { id: "a2", text: "هندسة زائدية", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "جون ناش" }, { id: "p2", name: "جون فون نيومان" }], achievements: [{ id: "a1", text: "توازن ناش", personId: "p1" }, { id: "a2", text: "نظرية الألعاب", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "أندرو وايلز" }, { id: "p2", name: "غريغوري بيرلمان" }], achievements: [{ id: "a1", text: "إثبات نظرية فيرما", personId: "p1" }, { id: "a2", text: "إثبات حدسية بوانكاريه", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "ليوبولد كرونيكر" }, { id: "p2", name: "ريتشارد ديدكيند" }], achievements: [{ id: "a1", text: "القطع ديدكيند", personId: "p2" }, { id: "a2", text: "جملة كرونيكر الشهيرة", personId: "p1" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "دافيد هيلبرت" }, { id: "p2", name: "كورت غودل" }], achievements: [{ id: "a1", text: "مسائل هيلبرت", personId: "p1" }, { id: "a2", text: "نظريات عدم الاكتمال", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "إميل بوريل" }, { id: "p2", name: "هنري لوبيغ" }], achievements: [{ id: "a1", text: "نظرية القياس", personId: "p1" }, { id: "a2", text: "تكامل لوبيغ", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "جوزيف لاغرانج" }, { id: "p2", name: "أوغستان لوي كوشي" }], achievements: [{ id: "a1", text: "معادلات لاغرانج", personId: "p1" }, { id: "a2", text: "صيغة كوشي للتكامل", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "صوفي جيرمان" }, { id: "p2", name: "إيميل أرتين" }], achievements: [{ id: "a1", text: "أعداد جيرمان الأولية", personId: "p1" }, { id: "a2", text: "قانون التبادل", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "شارل هرميت" }, { id: "p2", name: "فرديناند ليندمان" }], achievements: [{ id: "a1", text: "إثبات أن e غير جبري", personId: "p1" }, { id: "a2", text: "إثبات أن π غير جبري", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "بافنوتي تشيبيشيف" }, { id: "p2", name: "أندريه ماركوف" }], achievements: [{ id: "a1", text: "متباينات تشيبيشيف", personId: "p1" }, { id: "a2", text: "سلاسل ماركوف", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "فيبوناتشي" }, { id: "p2", name: "لوكا باتشولي" }], achievements: [{ id: "a1", text: "متتالية فيبوناتشي", personId: "p1" }, { id: "a2", text: "النسبة الذهبية", personId: "p2" }] }, difficulty: "medium" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "بول إردوس" }, { id: "p2", name: "تيرنس تاو" }], achievements: [{ id: "a1", text: "أكثر عالم رياضيات منشورات", personId: "p1" }, { id: "a2", text: "أصغر فائز بميدالية فيلدز", personId: "p2" }] }, difficulty: "hard" },
      { text: "وصّل:", whoAndWhoData: { people: [{ id: "p1", name: "الخوارزمي" }, { id: "p2", name: "عمر الخيام" }], achievements: [{ id: "a1", text: "أسس علم الجبر", personId: "p1" }, { id: "a2", text: "حل المعادلات التكعيبية", personId: "p2" }] }, difficulty: "medium" },
    ].map(q => ({ text: q.text, subjectId, questionTypeId: 'who-and-who', whoAndWhoData: q.whoAndWhoData, difficulty: q.difficulty as 'easy' | 'medium' | 'hard', points: q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20, timeLimit: 50 }));

    const allQuestions = [...fourOptionsQuestions, ...orderQuestions, ...whoAndWhoQuestions];
    await Question.insertMany(allQuestions);

    console.log(`✅ تم إضافة ${allQuestions.length} سؤال رياضي إضافي!`);
    console.log(`   - ${fourOptionsQuestions.length} أسئلة اختيار من 4`);
    console.log(`   - ${orderQuestions.length} أسئلة ترتيب`);
    console.log(`   - ${whoAndWhoQuestions.length} أسئلة من ومن`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

seedMathPart2();

