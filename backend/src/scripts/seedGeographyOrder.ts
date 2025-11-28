import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';

dotenv.config();

const seedGeographyOrder = async () => {
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

    console.log('🌱 Adding Geography Order Questions...');

    // Geography order questions
    const questionsData = [
      {
        text: "رتب المدن التالية من الشمال إلى الجنوب في قارة أفريقيا:",
        orderItems: [
          { id: "1", text: "تونس", correctPosition: 1 },
          { id: "2", text: "القاهرة", correctPosition: 2 },
          { id: "3", text: "الخرطوم", correctPosition: 3 },
          { id: "4", text: "نيروبي", correctPosition: 4 },
          { id: "5", text: "كيب تاون", correctPosition: 5 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الدول التالية من الغرب إلى الشرق على خط الاستواء تقريباً:",
        orderItems: [
          { id: "1", text: "الغابون", correctPosition: 1 },
          { id: "2", text: "الكونغو", correctPosition: 2 },
          { id: "3", text: "أوغندا", correctPosition: 3 },
          { id: "4", text: "كينيا", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الأنهار التالية حسب الطول من الأطول إلى الأقصر:",
        orderItems: [
          { id: "1", text: "الأمازون", correctPosition: 1 },
          { id: "2", text: "النيل", correctPosition: 2 },
          { id: "3", text: "اليانغتسي", correctPosition: 3 },
          { id: "4", text: "المسيسيبي-ميسوري", correctPosition: 4 },
          { id: "5", text: "الدانوب", correctPosition: 5 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الجبال التالية من الأعلى إلى الأقل ارتفاعاً:",
        orderItems: [
          { id: "1", text: "إفرست", correctPosition: 1 },
          { id: "2", text: "كي 2", correctPosition: 2 },
          { id: "3", text: "كانشينجونغا", correctPosition: 3 },
          { id: "4", text: "ماكينلي (دينالي)", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الدول العربية التالية من الأكبر إلى الأصغر مساحة:",
        orderItems: [
          { id: "1", text: "الجزائر", correctPosition: 1 },
          { id: "2", text: "السعودية", correctPosition: 2 },
          { id: "3", text: "ليبيا", correctPosition: 3 },
          { id: "4", text: "السودان", correctPosition: 4 },
          { id: "5", text: "مصر", correctPosition: 5 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب المدن الأوروبية التالية من الشمال إلى الجنوب:",
        orderItems: [
          { id: "1", text: "أوسلو", correctPosition: 1 },
          { id: "2", text: "ستوكهولم", correctPosition: 2 },
          { id: "3", text: "برلين", correctPosition: 3 },
          { id: "4", text: "روما", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب البحيرات التالية حسب الحجم من الأكبر إلى الأصغر:",
        orderItems: [
          { id: "1", text: "بحر قزوين", correctPosition: 1 },
          { id: "2", text: "بحيرة سوبيريور", correctPosition: 2 },
          { id: "3", text: "بحيرة فيكتوريا", correctPosition: 3 },
          { id: "4", text: "بحيرة بايكال", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الدول التالية من الأعلى إلى الأقل كثافة سكانية:",
        orderItems: [
          { id: "1", text: "موناكو", correctPosition: 1 },
          { id: "2", text: "سنغافورة", correctPosition: 2 },
          { id: "3", text: "بنغلاديش", correctPosition: 3 },
          { id: "4", text: "هولندا", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب المدن الأمريكية من الشرق إلى الغرب:",
        orderItems: [
          { id: "1", text: "نيويورك", correctPosition: 1 },
          { id: "2", text: "شيكاغو", correctPosition: 2 },
          { id: "3", text: "دنفر", correctPosition: 3 },
          { id: "4", text: "لوس أنجلوس", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الجزر التالية من الأكبر إلى الأصغر مساحة:",
        orderItems: [
          { id: "1", text: "غرينلاند", correctPosition: 1 },
          { id: "2", text: "غينيا الجديدة", correctPosition: 2 },
          { id: "3", text: "بورنيو", correctPosition: 3 },
          { id: "4", text: "مدغشقر", correctPosition: 4 },
          { id: "5", text: "بريطانيا العظمى", correctPosition: 5 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الدول الآسيوية التالية من الشرق إلى الغرب:",
        orderItems: [
          { id: "1", text: "اليابان", correctPosition: 1 },
          { id: "2", text: "الصين", correctPosition: 2 },
          { id: "3", text: "الهند", correctPosition: 3 },
          { id: "4", text: "تركيا", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الصحارى التالية من الأكبر إلى الأصغر مساحة:",
        orderItems: [
          { id: "1", text: "الصحراء الكبرى", correctPosition: 1 },
          { id: "2", text: "صحراء الربع الخالي", correctPosition: 2 },
          { id: "3", text: "صحراء غوبي", correctPosition: 3 },
          { id: "4", text: "صحراء كالاهاري", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب عواصم أمريكا الجنوبية من الشمال إلى الجنوب:",
        orderItems: [
          { id: "1", text: "كاراكاس", correctPosition: 1 },
          { id: "2", text: "بوغوتا", correctPosition: 2 },
          { id: "3", text: "ليما", correctPosition: 3 },
          { id: "4", text: "سانتياغو", correctPosition: 4 },
          { id: "5", text: "بوينس آيرس", correctPosition: 5 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الدول الأوروبية التالية من الأكبر إلى الأصغر مساحة:",
        orderItems: [
          { id: "1", text: "روسيا (الجزء الأوروبي)", correctPosition: 1 },
          { id: "2", text: "أوكرانيا", correctPosition: 2 },
          { id: "3", text: "فرنسا", correctPosition: 3 },
          { id: "4", text: "إسبانيا", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب المدن الخليجية من الشمال إلى الجنوب:",
        orderItems: [
          { id: "1", text: "الكويت", correctPosition: 1 },
          { id: "2", text: "الدمام", correctPosition: 2 },
          { id: "3", text: "الدوحة", correctPosition: 3 },
          { id: "4", text: "أبوظبي", correctPosition: 4 },
          { id: "5", text: "مسقط", correctPosition: 5 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الدول التالية حسب عدد السكان من الأكثر إلى الأقل (2025):",
        orderItems: [
          { id: "1", text: "الهند", correctPosition: 1 },
          { id: "2", text: "الصين", correctPosition: 2 },
          { id: "3", text: "الولايات المتحدة", correctPosition: 3 },
          { id: "4", text: "إندونيسيا", correctPosition: 4 }
        ],
        difficulty: "easy"
      },
      {
        text: "رتب الدول التالية من الأقرب إلى الأبعد عن القطب الشمالي:",
        orderItems: [
          { id: "1", text: "غرينلاند", correctPosition: 1 },
          { id: "2", text: "النرويج", correctPosition: 2 },
          { id: "3", text: "روسيا", correctPosition: 3 },
          { id: "4", text: "كندا", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب المدن المصرية من الشمال إلى الجنوب:",
        orderItems: [
          { id: "1", text: "الإسكندرية", correctPosition: 1 },
          { id: "2", text: "القاهرة", correctPosition: 2 },
          { id: "3", text: "أسيوط", correctPosition: 3 },
          { id: "4", text: "أسوان", correctPosition: 4 }
        ],
        difficulty: "easy"
      },
      {
        text: "رتب الدول التالية من الأعلى إلى الأقل ارتفاعاً عن سطح البحر (العاصمة):",
        orderItems: [
          { id: "1", text: "لاباز (بوليفيا)", correctPosition: 1 },
          { id: "2", text: "كيتو (الإكوادور)", correctPosition: 2 },
          { id: "3", text: "أديس أبابا (إثيوبيا)", correctPosition: 3 },
          { id: "4", text: "بوغوتا (كولومبيا)", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الدول التالية من الأكثر إلى الأقل طولاً للساحل البحري:",
        orderItems: [
          { id: "1", text: "كندا", correctPosition: 1 },
          { id: "2", text: "إندونيسيا", correctPosition: 2 },
          { id: "3", text: "روسيا", correctPosition: 3 },
          { id: "4", text: "الفلبين", correctPosition: 4 },
          { id: "5", text: "اليابان", correctPosition: 5 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب المدن الآسيوية من الغرب إلى الشرق:",
        orderItems: [
          { id: "1", text: "إسطنبول", correctPosition: 1 },
          { id: "2", text: "بيروت", correctPosition: 2 },
          { id: "3", text: "دبي", correctPosition: 3 },
          { id: "4", text: "نيودلهي", correctPosition: 4 },
          { id: "5", text: "طوكيو", correctPosition: 5 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الدول الأفريقية التالية من الشمال إلى الجنوب:",
        orderItems: [
          { id: "1", text: "المغرب", correctPosition: 1 },
          { id: "2", text: "مصر", correctPosition: 2 },
          { id: "3", text: "كينيا", correctPosition: 3 },
          { id: "4", text: "جنوب أفريقيا", correctPosition: 4 }
        ],
        difficulty: "easy"
      },
      {
        text: "رتب الدول التالية من الأبرد إلى الأدفأ مناخاً (متوسط درجة الحرارة السنوية):",
        orderItems: [
          { id: "1", text: "روسيا", correctPosition: 1 },
          { id: "2", text: "كندا", correctPosition: 2 },
          { id: "3", text: "الصين", correctPosition: 3 },
          { id: "4", text: "مصر", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الدول التالية من الأعلى إلى الأقل نسبة الأراضي المغطاة بالغابات:",
        orderItems: [
          { id: "1", text: "سورينام", correctPosition: 1 },
          { id: "2", text: "البرازيل", correctPosition: 2 },
          { id: "3", text: "إندونيسيا", correctPosition: 3 },
          { id: "4", text: "روسيا", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب المدن العربية من الأعلى إلى الأقل ارتفاعاً عن سطح البحر:",
        orderItems: [
          { id: "1", text: "صنعاء", correctPosition: 1 },
          { id: "2", text: "الطائف", correctPosition: 2 },
          { id: "3", text: "عمان", correctPosition: 3 },
          { id: "4", text: "بيروت", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب المدن السعودية التالية من الغرب إلى الشرق:",
        orderItems: [
          { id: "1", text: "جدة", correctPosition: 1 },
          { id: "2", text: "الطائف", correctPosition: 2 },
          { id: "3", text: "الرياض", correctPosition: 3 },
          { id: "4", text: "الدمام", correctPosition: 4 }
        ],
        difficulty: "easy"
      },
      {
        text: "رتب الدول التالية من الأكثر إلى الأقل كثافة سكانية في العالم العربي:",
        orderItems: [
          { id: "1", text: "البحرين", correctPosition: 1 },
          { id: "2", text: "لبنان", correctPosition: 2 },
          { id: "3", text: "فلسطين", correctPosition: 3 },
          { id: "4", text: "مصر", correctPosition: 4 },
          { id: "5", text: "الجزائر", correctPosition: 5 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الدول التالية من الأقرب إلى الأبعد عن خط غرينتش (0°):",
        orderItems: [
          { id: "1", text: "المغرب", correctPosition: 1 },
          { id: "2", text: "الجزائر", correctPosition: 2 },
          { id: "3", text: "ليبيا", correctPosition: 3 },
          { id: "4", text: "مصر", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الجزر البريطانية من الأكبر إلى الأصغر مساحة:",
        orderItems: [
          { id: "1", text: "بريطانيا العظمى", correctPosition: 1 },
          { id: "2", text: "أيرلندا", correctPosition: 2 },
          { id: "3", text: "جزيرة مان", correctPosition: 3 },
          { id: "4", text: "جزيرة وايت", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الدول الأوروبية من الأعلى إلى الأقل متوسط العمر المتوقع:",
        orderItems: [
          { id: "1", text: "إسبانيا", correctPosition: 1 },
          { id: "2", text: "سويسرا", correctPosition: 2 },
          { id: "3", text: "إيطاليا", correctPosition: 3 },
          { id: "4", text: "فرنسا", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب المدن الإفريقية من الأكبر إلى الأصغر عدد سكان (2025):",
        orderItems: [
          { id: "1", text: "القاهرة", correctPosition: 1 },
          { id: "2", text: "لاغوس", correctPosition: 2 },
          { id: "3", text: "كينشاسا", correctPosition: 3 },
          { id: "4", text: "جوهانسبرغ", correctPosition: 4 },
          { id: "5", text: "الخرطوم", correctPosition: 5 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الدول التالية من الأكثر إلى الأقل هطول أمطار سنوياً:",
        orderItems: [
          { id: "1", text: "كولومبيا", correctPosition: 1 },
          { id: "2", text: "إندونيسيا", correctPosition: 2 },
          { id: "3", text: "البرازيل", correctPosition: 3 },
          { id: "4", text: "الهند", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الدول التالية من الأعلى إلى الأقل نسبة الأمية:",
        orderItems: [
          { id: "1", text: "النيجر", correctPosition: 1 },
          { id: "2", text: "جنوب السودان", correctPosition: 2 },
          { id: "3", text: "أفغانستان", correctPosition: 3 },
          { id: "4", text: "مالي", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الدول التالية من الأقرب إلى الأبعد عن القطب الجنوبي:",
        orderItems: [
          { id: "1", text: "نيوزيلندا", correctPosition: 1 },
          { id: "2", text: "تشيلي", correctPosition: 2 },
          { id: "3", text: "الأرجنتين", correctPosition: 3 },
          { id: "4", text: "أستراليا", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب المدن العالمية من الأعلى إلى الأقل كلفة معيشة (2025):",
        orderItems: [
          { id: "1", text: "سنغافورة", correctPosition: 1 },
          { id: "2", text: "زيورخ", correctPosition: 2 },
          { id: "3", text: "هونغ كونغ", correctPosition: 3 },
          { id: "4", text: "نيويورك", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الدول التالية من الأكبر إلى الأصغر عدد البراكين النشطة:",
        orderItems: [
          { id: "1", text: "إندونيسيا", correctPosition: 1 },
          { id: "2", text: "اليابان", correctPosition: 2 },
          { id: "3", text: "الولايات المتحدة", correctPosition: 3 },
          { id: "4", text: "روسيا", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الدول التالية من الأكثر إلى الأقل طولاً للحدود البرية:",
        orderItems: [
          { id: "1", text: "روسيا", correctPosition: 1 },
          { id: "2", text: "الصين", correctPosition: 2 },
          { id: "3", text: "البرازيل", correctPosition: 3 },
          { id: "4", text: "الهند", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب الدول الإسكندنافية من الشرق إلى الغرب:",
        orderItems: [
          { id: "1", text: "فنلندا", correctPosition: 1 },
          { id: "2", text: "السويد", correctPosition: 2 },
          { id: "3", text: "النرويج", correctPosition: 3 },
          { id: "4", text: "الدنمارك", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الدول التالية من الأكثر إلى الأقل مساحة مغطاة بالثلوج دائماً:",
        orderItems: [
          { id: "1", text: "القارة القطبية الجنوبية", correctPosition: 1 },
          { id: "2", text: "غرينلاند", correctPosition: 2 },
          { id: "3", text: "كندا", correctPosition: 3 },
          { id: "4", text: "روسيا", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب المدن التونسية من الشمال إلى الجنوب:",
        orderItems: [
          { id: "1", text: "بنزرت", correctPosition: 1 },
          { id: "2", text: "تونس العاصمة", correctPosition: 2 },
          { id: "3", text: "صفاقس", correctPosition: 3 },
          { id: "4", text: "قابس", correctPosition: 4 }
        ],
        difficulty: "easy"
      },
      {
        text: "رتب الدول التالية من الأكثر إلى الأقل إنتاجاً للنفط (2025):",
        orderItems: [
          { id: "1", text: "السعودية", correctPosition: 1 },
          { id: "2", text: "روسيا", correctPosition: 2 },
          { id: "3", text: "الولايات المتحدة", correctPosition: 3 },
          { id: "4", text: "الإمارات", correctPosition: 4 },
          { id: "5", text: "العراق", correctPosition: 5 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الدول التالية من الأعلى إلى الأقل متوسط درجة الحرارة في يناير:",
        orderItems: [
          { id: "1", text: "الإمارات", correctPosition: 1 },
          { id: "2", text: "مصر", correctPosition: 2 },
          { id: "3", text: "المغرب", correctPosition: 3 },
          { id: "4", text: "تركيا", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الدول التالية من الأكبر إلى الأصغر عدد الجزر:",
        orderItems: [
          { id: "1", text: "السويد", correctPosition: 1 },
          { id: "2", text: "فنلندا", correctPosition: 2 },
          { id: "3", text: "النرويج", correctPosition: 3 },
          { id: "4", text: "إندونيسيا", correctPosition: 4 }
        ],
        difficulty: "hard"
      },
      {
        text: "رتب المدن الليبية من الغرب إلى الشرق:",
        orderItems: [
          { id: "1", text: "طرابلس", correctPosition: 1 },
          { id: "2", text: "مصراتة", correctPosition: 2 },
          { id: "3", text: "سرت", correctPosition: 3 },
          { id: "4", text: "بنغازي", correctPosition: 4 }
        ],
        difficulty: "medium"
      },
      {
        text: "رتب الدول التالية من الأكثر إلى الأقل مساحة أراضي زراعية:",
        orderItems: [
          { id: "1", text: "الصين", correctPosition: 1 },
          { id: "2", text: "الهند", correctPosition: 2 },
          { id: "3", text: "الولايات المتحدة", correctPosition: 3 },
          { id: "4", text: "روسيا", correctPosition: 4 }
        ],
        difficulty: "hard"
      }
    ];

    // Prepare questions for insertion
    const questionsToInsert = questionsData.map((q: any) => ({
      text: q.text,
      subjectId: subjectId,
      questionTypeId: 'order-challenge',
      orderItems: q.orderItems,
      difficulty: q.difficulty || 'easy',
      points: q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20,
      timeLimit: 45,
    }));

    // Insert questions
    await Question.insertMany(questionsToInsert);

    console.log(`✅ تم إضافة ${questionsToInsert.length} سؤال جغرافي (ترتيب)!`);
    console.log(`   - جميع الأسئلة من نوع: ترتيب`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

seedGeographyOrder();

