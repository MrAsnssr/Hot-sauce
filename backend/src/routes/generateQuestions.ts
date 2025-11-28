import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Question from '../models/Question.js';
import Subject from '../models/Subject.js';

const router = express.Router();

// Question types for generation
const QUESTION_TYPES = [
  { id: 'multiple-choice', nameAr: 'اختيار من متعدد', timeLimit: 30 },
  { id: 'true-false', nameAr: 'صح/خطأ', timeLimit: 20 },
  { id: 'fill-blank', nameAr: 'املأ الفراغ', timeLimit: 40 },
  { id: 'comparison-question', nameAr: 'سؤال المقارنة', timeLimit: 35 },
  { id: 'order-challenge', nameAr: 'تحدي الترتيب', timeLimit: 45 },
  { id: 'rapid-fire', nameAr: 'إطلاق سريع', timeLimit: 15 },
];

// Generate questions with Gemini AI
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { subjectId, count = 10 } = req.body;

    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }

    // Check for Gemini API key
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    console.log('🔍 Gemini API check:', geminiKey ? `Found (${geminiKey.substring(0, 10)}...)` : 'NOT FOUND');
    
    if (!geminiKey) {
      return res.status(500).json({ 
        error: 'Gemini API key not configured. Add GEMINI_API_KEY to your .env file.',
        hint: 'Get free key from https://makersuite.google.com/app/apikey'
      });
    }

    // Get subject
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(geminiKey);

    // Send immediate response
    res.status(200).json({
      message: 'Question generation started with Gemini AI',
      subject: subject.nameAr,
      targetCount: count * QUESTION_TYPES.length,
      status: 'processing',
      provider: 'Google Gemini'
    });

    // Generate questions asynchronously
    generateQuestionsAsync(genAI, subject, count);

  } catch (error: any) {
    console.error('Error starting generation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Async question generation with Gemini
async function generateQuestionsAsync(genAI: GoogleGenerativeAI, subject: any, countPerType: number) {
  let totalGenerated = 0;
  const totalTypes = QUESTION_TYPES.length;
  const totalTarget = countPerType * totalTypes;
  
  console.log(`\n🚀 ===== STARTING QUESTION GENERATION =====`);
  console.log(`📚 Subject: ${subject.nameAr}`);
  console.log(`🎯 Target: ${totalTarget} questions (${countPerType} per type × ${totalTypes} types)`);
  console.log(`🤖 Using: Google Gemini AI\n`);
  
  // Try different model names
  const modelsToTry = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
  let model: any = null;
  let modelName = '';
  
  for (const modelNameToTry of modelsToTry) {
    try {
      console.log(`🔍 Trying model: ${modelNameToTry}...`);
      model = genAI.getGenerativeModel({ model: modelNameToTry });
      modelName = modelNameToTry;
      console.log(`✅ Model ${modelNameToTry} is available!\n`);
      break;
    } catch (e) {
      console.log(`❌ Model ${modelNameToTry} not available, trying next...`);
    }
  }
  
  if (!model) {
    console.error('❌ No available Gemini model found!');
    return;
  }
  
  for (let i = 0; i < QUESTION_TYPES.length; i++) {
    const qType = QUESTION_TYPES[i];
    const step = i + 1;
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 STEP ${step}/${totalTypes}: ${qType.nameAr}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`⏳ Sending request to Gemini AI...`);
    
    try {
      const prompt = `أنشئ ${countPerType} سؤالاً باللغة العربية في موضوع "${subject.nameAr}".

المتطلبات:
- كل سؤال يجب أن يكون باختيار من متعدد مع 4 خيارات
- خيار واحد فقط صحيح
- تنويع في الصعوبة (سهل، متوسط، صعب)
- أسئلة واقعية ومفيدة وتعليمية

أرجع JSON فقط بدون أي نص إضافي بهذا الشكل بالضبط:
{"questions":[{"text":"نص السؤال","options":[{"text":"الخيار 1","isCorrect":false},{"text":"الخيار 2","isCorrect":true},{"text":"الخيار 3","isCorrect":false},{"text":"الخيار 4","isCorrect":false}],"difficulty":"medium"}]}

مهم جداً: أرجع JSON فقط بدون markdown أو أي تنسيق آخر.`;

      const startTime = Date.now();
      const result = await model.generateContent(prompt);
      const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Received response from Gemini (${responseTime}s)`);
      
      const responseText = result.response.text();
      console.log(`📄 Processing response (${responseText.length} characters)...`);
      
      // Clean up response - remove markdown code blocks if present
      let cleanJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Try to parse JSON
      let parsed;
      try {
        parsed = JSON.parse(cleanJson);
        console.log(`✅ JSON parsed successfully`);
      } catch (parseError) {
        console.log(`⚠️  First parse failed, trying to extract JSON...`);
        // Try to extract JSON from response
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
          console.log(`✅ JSON extracted and parsed`);
        } else {
          console.error(`❌ Failed to parse JSON. Response preview:`, cleanJson.substring(0, 200));
          console.log(`⏭️  Skipping this question type...\n`);
          continue;
        }
      }

      const questions = parsed.questions || [];
      console.log(`📊 Found ${questions.length} questions in response`);

      // Save questions
      console.log(`💾 Saving questions to database...`);
      let savedCount = 0;
      for (const q of questions) {
        if (!q.text || !q.options) {
          console.log(`⚠️  Skipping invalid question (missing text or options)`);
          continue;
        }
        
        // Ensure one correct answer
        const correctCount = q.options.filter((o: any) => o.isCorrect).length;
        if (correctCount === 0 && q.options.length > 0) {
          q.options[0].isCorrect = true;
          console.log(`🔧 Fixed: Set first option as correct (no correct answer found)`);
        }

        try {
          await Question.create({
            text: q.text,
            subjectId: subject._id,
            questionTypeId: qType.id,
            options: q.options.map((opt: any, idx: number) => ({
              id: `opt-${idx}`,
              text: opt.text,
              isCorrect: !!opt.isCorrect,
            })),
            difficulty: q.difficulty || 'medium',
            points: 10,
            timeLimit: qType.timeLimit,
          });
          savedCount++;
          totalGenerated++;
        } catch (saveError: any) {
          console.error(`❌ Error saving question:`, saveError.message);
        }
      }
      
      console.log(`✅ Saved ${savedCount}/${questions.length} questions for ${qType.nameAr}`);
      console.log(`📈 Progress: ${totalGenerated}/${totalTarget} total questions generated`);
      
      // Delay between batches to avoid rate limits
      if (i < QUESTION_TYPES.length - 1) {
        console.log(`⏸️  Waiting 2 seconds before next type...`);
        await new Promise(r => setTimeout(r, 2000));
      }
      
    } catch (error: any) {
      console.error(`\n❌ ERROR in step ${step} (${qType.nameAr}):`);
      console.error(`   ${error.message}`);
      console.log(`⏭️  Continuing with next question type...\n`);
    }
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎉 GENERATION COMPLETE!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📚 Subject: ${subject.nameAr}`);
  console.log(`✅ Total generated: ${totalGenerated} questions`);
  console.log(`🎯 Target was: ${totalTarget} questions`);
  console.log(`📊 Success rate: ${((totalGenerated / totalTarget) * 100).toFixed(1)}%`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

// Get question count for a subject
router.get('/status/:subjectId', async (req: Request, res: Response) => {
  try {
    const count = await Question.countDocuments({ subjectId: req.params.subjectId });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
