import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';

dotenv.config();

const seedMoviesTVFillBlanks = async () => {
  try {
    await connectDatabase();

    // Find or create Movies and TV Shows subject
    let moviesSubject = await Subject.findOne({ name: 'Movies and TV Shows' });
    if (!moviesSubject) {
      moviesSubject = await Subject.create({
        name: 'Movies and TV Shows',
        nameAr: 'الأفلام والمسلسلات',
        description: 'أسئلة حول الأفلام والمسلسلات التلفزيونية',
        color: '#f59e0b'
      });
      console.log('✅ Created Movies and TV Shows subject');
    } else {
      console.log('✅ Movies and TV Shows subject already exists');
    }
    const subjectId = moviesSubject._id;

    console.log('🌱 Adding Movies and TV Shows Fill-in-the-Blank Questions...');

    // Movies and TV Shows fill-in-the-blank questions
    const questionsData = [
      { text: "فاز فيلم ________ بجائزة الأوسكار لأفضل فيلم عام 2020.", correctAnswer: "Parasite", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "مسلسل الخيال العلمي الشهير 'سترينجر ثينغز' (Stranger Things) يُعرض على منصة ________.", correctAnswer: "Netflix", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "الشخصية الرئيسية في سلسلة أفلام 'جيمس بوند' (James Bond) تحمل الرقم السري ________.", correctAnswer: "007", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "الممثل الذي أدى دور 'أيرون مان' (الرجل الحديدي) هو ________.", correctAnswer: "Robert Downey Jr.", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "فيلم 'تايتانيك' (Titanic) من إخراج المخرج الشهير ________.", correctAnswer: "James Cameron", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "يُعرف الممثل ________ بدوره في فيلم 'الجوكر' (Joker) عام 2019.", correctAnswer: "Joaquin Phoenix", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "السلسلة الأصلية لفيلم 'حرب النجوم' (Star Wars) بدأت في عام ________.", correctAnswer: "1977", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "تُقام فعاليات مهرجان كان السينمائي في دولة ________.", correctAnswer: "فرنسا", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "فيلم الرسوم المتحركة الذي أنتجته بيكسار ويحكي عن ألعاب حية هو ________.", correctAnswer: "Toy Story", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "مسلسل 'صراع العروش' (Game of Thrones) مبني على روايات تحمل اسم ________.", correctAnswer: "A Song of Ice and Fire", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "أول فيلم ناطق بالكامل في تاريخ السينما الأمريكية هو ________.", correctAnswer: "The Jazz Singer", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "حصلت الممثلة ________ على جائزة الأوسكار كأصغر ممثلة رئيسية عن دورها في فيلم 'الأرض' عام 1986.", correctAnswer: "Marlee Matlin", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "تم تصوير جزء كبير من ثلاثية 'سيد الخواتم' (The Lord of the Rings) في ________.", correctAnswer: "نيوزيلندا", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "المخرج الذي قام بإخراج فيلم 'العراب' (The Godfather) هو ________.", correctAnswer: "Francis Ford Coppola", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "في عالم مارفل السينمائي، اسم الكوكب الأصلي لشخصية 'ثور' (Thor) هو ________.", correctAnswer: "Asgard", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "سلسلة أفلام الحركة الشهيرة 'مهمة مستحيلة' (Mission: Impossible) من بطولة ________.", correctAnswer: "Tom Cruise", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "أول فيلم رسوم متحركة طويل أنتجته ديزني هو فيلم ________.", correctAnswer: "Snow White and the Seven Dwarfs", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "الشخصية الخارقة 'سوبرمان' (Superman) ظهرت لأول مرة في الكتب المصورة عام ________.", correctAnswer: "1938", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "فيلم الخيال العلمي الذي شارك فيه ليوناردو دي كابريو وكان يدور حول الأحلام هو ________.", correctAnswer: "Inception", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "منصة البث المباشر المملوكة لشركة أمازون هي ________.", correctAnswer: "Prime Video", difficulty: "easy", points: 10, timeLimit: 30 },
      { text: "الممثل الذي قام بدور 'هاري بوتر' (Harry Potter) في سلسلة الأفلام هو ________.", correctAnswer: "Daniel Radcliffe", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "فيلم 'الساحر أوز' (The Wizard of Oz) صدر في عام ________.", correctAnswer: "1939", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "سلسلة أفلام 'بليد رانر' (Blade Runner) مستوحاة من رواية للكاتب ________.", correctAnswer: "Philip K. Dick", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "الممثل ________ هو من قام بأداء صوت شخصية 'وودي' في فيلم 'حكاية لعبة' (Toy Story).", correctAnswer: "Tom Hanks", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "اسم المخرج الهندي الحائز على جائزة الأوسكار والذي يُعرف بأفلام مثل 'بانثر بانشالي' (Pather Panchali) هو ________.", correctAnswer: "Satyajit Ray", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "جائزة الأفلام البريطانية تعقد سنوياً بواسطة ________.", correctAnswer: "BAFTA", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "مسلسل 'بريكينغ باد' (Breaking Bad) تدور أحداثه بشكل رئيسي في مدينة ________ الأمريكية.", correctAnswer: "Albuquerque", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "فيلم 'سايكو' (Psycho) عام 1960 هو أحد أشهر أفلام المخرج ________.", correctAnswer: "Alfred Hitchcock", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "أول فيلم لـ 'مارفل' تم عرضه ضمن عالم مارفل السينمائي (MCU) هو ________.", correctAnswer: "Iron Man", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "اسم استوديو الرسوم المتحركة الذي أنتج أفلام 'شريك' (Shrek) و'كيف تروض تنينك' هو ________.", correctAnswer: "DreamWorks", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "أول فيلم فاز بجائزة الأوسكار لأفضل فيلم وتم إنتاجه بتقنية ثلاثية الأبعاد هو ________.", correctAnswer: "Avatar", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "الكاتب الذي ابتكر شخصية المحقق الشهير 'شيرلوك هولمز' هو ________.", correctAnswer: "Arthur Conan Doyle", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "الممثلة التي شاركت في فيلم 'لا لا لاند' (La La Land) وفازت عنه بالأوسكار هي ________.", correctAnswer: "Emma Stone", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "تم إنشاء 'جائزة السعفة الذهبية' (Palme d'Or) في مهرجان كان السينمائي عام ________.", correctAnswer: "1955", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "فيلم الأكشن والدراما الذي أخرجه ريدلي سكوت عام 2000 وفاز بجائزة الأوسكار هو ________.", correctAnswer: "Gladiator", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "المسلسل التلفزيوني الكوميدي الشهير الذي تدور أحداثه حول ستة أصدقاء في مدينة نيويورك هو ________.", correctAnswer: "Friends", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "الممثل الذي قام بأداء شخصية 'جوكر' في فيلم 'فارس الظلام' (The Dark Knight) هو ________.", correctAnswer: "Heath Ledger", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "استوديو الإنتاج المسؤول عن أفلام 'جون ويك' (John Wick) هو ________.", correctAnswer: "Lionsgate", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "سلسلة أفلام الرعب الشهيرة التي بدأت عام 1978 وتدور حول شخصية 'مايكل مايرز' هي ________.", correctAnswer: "Halloween", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "فيلم 'شلالات نياجرا' عام 1953 هو أحد الأفلام التي لعبت فيها الممثلة ________ دور البطولة.", correctAnswer: "Marilyn Monroe", difficulty: "medium", points: 15, timeLimit: 40 },
      { text: "يُعرف المخرج ________ بأسلوبه البصري المميز واستخدامه المفرط لتقنية 'سلوموشن' في أفلام مثل '300' و'واتشمن'.", correctAnswer: "Zack Snyder", difficulty: "hard", points: 20, timeLimit: 50 },
      { text: "مصطلح 'السينما الحرة البريطانية' (Free Cinema) نشأ في فترة ________ من القرن العشرين.", correctAnswer: "الخمسينات (1950s)", difficulty: "hard", points: 20, timeLimit: 50 },
      { text: "أول ممثلة سمراء تفوز بجائزة الأوسكار لأفضل ممثلة رئيسية كانت ________ عن فيلم 'مونستر بول' عام 2001.", correctAnswer: "Halle Berry", difficulty: "hard", points: 20, timeLimit: 50 },
      { text: "مسلسل 'سوبرانو' (The Sopranos) هو مسلسل درامي شهير من إنتاج شبكة ________.", correctAnswer: "HBO", difficulty: "hard", points: 20, timeLimit: 50 },
      { text: "أول فيلم في التاريخ يستخدم تقنية 'المونتاج المتوازي' (Parallel Editing) بشكل بارز كان ________ عام 1915.", correctAnswer: "The Birth of a Nation", difficulty: "hard", points: 20, timeLimit: 50 },
      { text: "يُعد المخرج الفرنسي ________ رائد 'الموجة الجديدة' الفرنسية (Nouvelle Vague).", correctAnswer: "Jean-Luc Godard", difficulty: "hard", points: 20, timeLimit: 50 },
      { text: "المخرج ________ هو الوحيد الذي فاز بثلاث جوائز أوسكار لأفضل مخرج (إنجاز).", correctAnswer: "John Ford", difficulty: "hard", points: 20, timeLimit: 50 },
      { text: "اسم الممثل الذي أدى دور 'هنيبعل ليكتر' في فيلم 'صمت الحملان' (The Silence of the Lambs) هو ________.", correctAnswer: "Anthony Hopkins", difficulty: "hard", points: 20, timeLimit: 50 },
      { text: "يُعد فيلم ________ (1941) إنجازاً في استخدام التصوير العميق (Deep Focus) والمونتاج المعقد.", correctAnswer: "Citizen Kane", difficulty: "hard", points: 20, timeLimit: 50 },
      { text: "الممثلة التي حصلت على لقب 'ملكة الإثارة الهوليوودية' في الأربعينات والخمسينات هي ________.", correctAnswer: "Rita Hayworth", difficulty: "hard", points: 20, timeLimit: 50 }
    ];

    // Prepare questions for insertion
    const questionsToInsert = questionsData.map((q: any) => ({
      text: q.text,
      subjectId: subjectId,
      questionTypeId: 'fill-blank',
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty || 'easy',
      points: q.points || (q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20),
      timeLimit: q.timeLimit || (q.difficulty === 'easy' ? 30 : q.difficulty === 'medium' ? 40 : 50),
    }));

    // Insert questions
    await Question.insertMany(questionsToInsert);

    console.log(`✅ تم إضافة ${questionsToInsert.length} سؤال عن الأفلام والمسلسلات (ملء الفراغ)!`);
    console.log(`   - جميع الأسئلة من نوع: ملء الفراغ`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

seedMoviesTVFillBlanks();