import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import Question from '../models/Question.js';
import Subject from '../models/Subject.js';
import QuestionType from '../models/QuestionType.js';

const router = express.Router();

// Initialize OpenAI client only when API key is available
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

interface QuestionGenerationRequest {
  subjectId: string;
  count?: number;
}

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { subjectId, count = 1000 }: QuestionGenerationRequest = req.body;

    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }

    const openai = getOpenAIClient();
    if (!openai) {
      return res.status(500).json({ error: 'OpenAI API key not configured. Add OPENAI_API_KEY to your .env file.' });
    }

    // Get subject and question types
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const questionTypes = await QuestionType.find();
    if (questionTypes.length === 0) {
      return res.status(404).json({ error: 'No question types found' });
    }

    // Generate questions in batches
    const batchSize = 50; // Generate 50 questions per API call
    const batches = Math.ceil(count / batchSize);
    let totalGenerated = 0;
    const errors: string[] = [];

    res.status(200).json({
      message: 'Question generation started',
      subject: subject.nameAr,
      targetCount: count,
    });

    // Generate questions asynchronously
    (async () => {
      for (let batch = 0; batch < batches; batch++) {
        const currentBatchSize = Math.min(batchSize, count - totalGenerated);
        
        try {
          const prompt = `أنشئ ${currentBatchSize} سؤالاً باللغة العربية في موضوع "${subject.nameAr}" (${subject.name}).

المتطلبات:
1. كل سؤال يجب أن يكون باختيار من متعدد مع 4 خيارات
2. خيار واحد فقط صحيح
3. الأسئلة يجب أن تكون متنوعة في الصعوبة (سهل، متوسط، صعب)
4. الأسئلة يجب أن تكون واقعية ومفيدة
5. الإجابات يجب أن تكون واضحة ودقيقة

قم بإرجاع النتائج بصيغة JSON:
{
  "questions": [
    {
      "text": "نص السؤال",
      "options": [
        {"text": "الخيار الأول", "isCorrect": true/false},
        {"text": "الخيار الثاني", "isCorrect": true/false},
        {"text": "الخيار الثالث", "isCorrect": true/false},
        {"text": "الخيار الرابع", "isCorrect": true/false}
      ],
      "difficulty": "easy/medium/hard",
      "points": 10
    }
  ]
}

تأكد من أن كل سؤال له خيار واحد فقط صحيح.`;

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'أنت مساعد متخصص في إنشاء أسئلة تعليمية باللغة العربية. قم بإرجاع النتائج بصيغة JSON فقط.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          });

          const responseText = completion.choices[0]?.message?.content;
          if (!responseText) {
            errors.push(`Batch ${batch + 1}: No response from OpenAI`);
            continue;
          }

          const parsed = JSON.parse(responseText);
          const questions = parsed.questions || [];

          // Save questions to database
          for (const q of questions) {
            try {
              const question = new Question({
                text: q.text,
                subjectId: subject._id,
                questionTypeId: questionTypes[0]._id, // Use first question type
                options: q.options.map((opt: any, idx: number) => ({
                  id: `opt-${idx}`,
                  text: opt.text,
                  isCorrect: opt.isCorrect || false,
                })),
                difficulty: q.difficulty || 'medium',
                points: q.points || 10,
                timeLimit: 30,
              });

              await question.save();
              totalGenerated++;
            } catch (err: any) {
              errors.push(`Error saving question: ${err.message}`);
            }
          }

          // Small delay between batches to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error: any) {
          errors.push(`Batch ${batch + 1}: ${error.message}`);
        }
      }

      console.log(`✅ Generated ${totalGenerated} questions for ${subject.nameAr}`);
      if (errors.length > 0) {
        console.error('Errors:', errors);
      }
    })();

    res.json({
      message: 'Question generation started',
      subject: subject.nameAr,
      targetCount: count,
      status: 'processing',
    });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status/:subjectId', async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const count = await Question.countDocuments({ subjectId: subjectId });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

