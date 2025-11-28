import express, { Request, Response } from 'express';
import Question from '../models/Question.js';
import Subject from '../models/Subject.js';

const router = express.Router();

// Get all questions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { subjectId, questionTypeId, difficulty } = req.query;
    const filter: any = {};
    
    if (subjectId) filter.subjectId = subjectId;
    if (questionTypeId) filter.questionTypeId = questionTypeId;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .populate('subjectId')
      .populate('questionTypeId')
      .sort({ createdAt: -1 });
    
    res.json(questions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get question by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('subjectId')
      .populate('questionTypeId');
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Convert multiple question structures to database format and create (batch)
router.post('/convert/batch', async (req: Request, res: Response) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'questions array is required' });
    }

    const results = {
      success: [] as any[],
      errors: [] as any[],
    };

    for (let i = 0; i < questions.length; i++) {
      try {
        const questionData = questions[i];
        const { text, questionTypeId, subjectId, difficulty, points, timeLimit, ...rest } = questionData;

        // Validate required fields
        if (!text || !questionTypeId || !subjectId) {
          results.errors.push({
            index: i,
            error: 'Missing required fields: text, questionTypeId, or subjectId',
            data: questionData,
          });
          continue;
        }

        // Verify subject exists
        const subject = await Subject.findById(subjectId);
        if (!subject) {
          results.errors.push({
            index: i,
            error: `Subject not found: ${subjectId}`,
            data: questionData,
          });
          continue;
        }

        // Build question object based on question type
        const questionObj: any = {
          text,
          subjectId,
          questionTypeId,
          difficulty: difficulty || 'medium',
          points: points || (difficulty === 'easy' ? 10 : difficulty === 'hard' ? 20 : 15),
          timeLimit: timeLimit || (difficulty === 'easy' ? 30 : difficulty === 'hard' ? 50 : 40),
        };

        // Handle different question types (same logic as single convert)
        switch (questionTypeId) {
          case 'fill-blank':
            if (!rest.correctAnswer) {
              results.errors.push({
                index: i,
                error: 'correctAnswer is required for fill-blank questions',
                data: questionData,
              });
              continue;
            }
            questionObj.correctAnswer = rest.correctAnswer;
            break;

          case 'four-options':
            if (!rest.options || !Array.isArray(rest.options) || rest.options.length !== 4) {
              results.errors.push({
                index: i,
                error: 'options array with exactly 4 items is required',
                data: questionData,
              });
              continue;
            }
            const correctCount = rest.options.filter((opt: any) => opt.isCorrect).length;
            if (correctCount !== 1) {
              results.errors.push({
                index: i,
                error: 'Exactly one option must be marked as correct',
                data: questionData,
              });
              continue;
            }
            questionObj.options = rest.options;
            break;

          case 'order-challenge':
            if (!rest.orderItems || !Array.isArray(rest.orderItems)) {
              results.errors.push({
                index: i,
                error: 'orderItems array is required',
                data: questionData,
              });
              continue;
            }
            if (rest.orderItems.length < 4 || rest.orderItems.length > 5) {
              results.errors.push({
                index: i,
                error: 'orderItems must contain 4 or 5 items',
                data: questionData,
              });
              continue;
            }
            const hasAllPositions = rest.orderItems.every((item: any) => 
              typeof item.correctPosition === 'number' && item.id && item.text
            );
            if (!hasAllPositions) {
              results.errors.push({
                index: i,
                error: 'All orderItems must have id, text, and correctPosition',
                data: questionData,
              });
              continue;
            }
            questionObj.orderItems = rest.orderItems;
            break;

          case 'who-and-who':
            if (!rest.whoAndWhoData) {
              results.errors.push({
                index: i,
                error: 'whoAndWhoData is required',
                data: questionData,
              });
              continue;
            }
            const { people, achievements } = rest.whoAndWhoData;
            if (!people || !Array.isArray(people) || people.length !== 2) {
              results.errors.push({
                index: i,
                error: 'whoAndWhoData.people must be an array with exactly 2 people',
                data: questionData,
              });
              continue;
            }
            if (!achievements || !Array.isArray(achievements) || achievements.length !== 2) {
              results.errors.push({
                index: i,
                error: 'whoAndWhoData.achievements must be an array with exactly 2 achievements',
                data: questionData,
              });
              continue;
            }
            const peopleIds = people.map((p: any) => p.id);
            const allAchievementsValid = achievements.every((ach: any) => 
              ach.id && ach.text && ach.personId && peopleIds.includes(ach.personId)
            );
            if (!allAchievementsValid) {
              results.errors.push({
                index: i,
                error: 'All achievements must have id, text, and a valid personId',
                data: questionData,
              });
              continue;
            }
            questionObj.whoAndWhoData = {
              people: people.map((p: any) => ({
                id: p.id,
                name: p.name,
                imageUrl: p.imageUrl || undefined,
              })),
              achievements: achievements.map((a: any) => ({
                id: a.id,
                text: a.text,
                personId: a.personId,
              })),
            };
            break;

          default:
            results.errors.push({
              index: i,
              error: `Unsupported questionTypeId: ${questionTypeId}`,
              data: questionData,
            });
            continue;
        }

        // Create and save the question
        const question = new Question(questionObj);
        await question.save();
        await question.populate('subjectId');
        
        results.success.push({
          index: i,
          question,
        });
      } catch (error: any) {
        results.errors.push({
          index: i,
          error: error.message,
          data: questions[i],
        });
      }
    }

    res.status(201).json({
      message: `Processed ${questions.length} questions`,
      total: questions.length,
      successful: results.success.length,
      failed: results.errors.length,
      results,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Helper function to process a single question
const processSingleQuestion = async (questionData: any) => {
  const { text, questionTypeId, subjectId, difficulty, points, timeLimit, ...rest } = questionData;

  // Validate required fields
  if (!text) {
    throw new Error('Text is required');
  }
  if (!questionTypeId) {
    throw new Error('questionTypeId is required');
  }
  if (!subjectId) {
    throw new Error('subjectId is required');
  }

  // Verify subject exists
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new Error(`Subject not found: ${subjectId}`);
  }

  // Build question object based on question type
  const questionObj: any = {
      text,
      subjectId,
      questionTypeId,
      difficulty: difficulty || 'medium',
      points: points || (difficulty === 'easy' ? 10 : difficulty === 'hard' ? 20 : 15),
      timeLimit: timeLimit || (difficulty === 'easy' ? 30 : difficulty === 'hard' ? 50 : 40),
    };

    // Handle different question types
    switch (questionTypeId) {
    case 'fill-blank':
      // Fill the blank question
      if (!rest.correctAnswer) {
        throw new Error('correctAnswer is required for fill-blank questions');
      }
      questionObj.correctAnswer = rest.correctAnswer;
      break;

    case 'four-options':
      // Multiple choice question
      if (!rest.options || !Array.isArray(rest.options) || rest.options.length !== 4) {
        throw new Error('options array with exactly 4 items is required for four-options questions');
      }
      // Validate that exactly one option is correct
      const correctCount = rest.options.filter((opt: any) => opt.isCorrect).length;
      if (correctCount !== 1) {
        throw new Error('Exactly one option must be marked as correct');
      }
      questionObj.options = rest.options;
      break;

    case 'order-challenge':
      // Chronological order question
      if (!rest.orderItems || !Array.isArray(rest.orderItems)) {
        throw new Error('orderItems array is required for order-challenge questions');
      }
      if (rest.orderItems.length < 4 || rest.orderItems.length > 5) {
        throw new Error('orderItems must contain 4 or 5 items');
      }
      // Validate that all items have correctPosition
      const hasAllPositions = rest.orderItems.every((item: any) => 
        typeof item.correctPosition === 'number' && item.id && item.text
      );
      if (!hasAllPositions) {
        throw new Error('All orderItems must have id, text, and correctPosition');
      }
      questionObj.orderItems = rest.orderItems;
      break;

    case 'who-and-who':
      // Link people to achievements question
      if (!rest.whoAndWhoData) {
        throw new Error('whoAndWhoData is required for who-and-who questions');
      }
      const { people, achievements } = rest.whoAndWhoData;
      if (!people || !Array.isArray(people) || people.length !== 2) {
        throw new Error('whoAndWhoData.people must be an array with exactly 2 people');
      }
      if (!achievements || !Array.isArray(achievements) || achievements.length !== 2) {
        throw new Error('whoAndWhoData.achievements must be an array with exactly 2 achievements');
      }
      // Validate that each achievement has a personId matching one of the people
      const peopleIds = people.map((p: any) => p.id);
      const allAchievementsValid = achievements.every((ach: any) => 
        ach.id && ach.text && ach.personId && peopleIds.includes(ach.personId)
      );
      if (!allAchievementsValid) {
        throw new Error('All achievements must have id, text, and a valid personId');
      }
      questionObj.whoAndWhoData = {
        people: people.map((p: any) => ({
          id: p.id,
          name: p.name,
          imageUrl: p.imageUrl || undefined,
        })),
        achievements: achievements.map((a: any) => ({
          id: a.id,
          text: a.text,
          personId: a.personId,
        })),
      };
      break;

    default:
      throw new Error(`Unsupported questionTypeId: ${questionTypeId}. Supported types: fill-blank, four-options, order-challenge, who-and-who`);
  }

  // Create and save the question
  const question = new Question(questionObj);
  await question.save();
  await question.populate('subjectId');
  
  return question;
};

// Convert question structure to database format and create
// Supports both single question object and array of questions
router.post('/convert', async (req: Request, res: Response) => {
  try {
    // Check if request body is an array (multiple questions)
    if (Array.isArray(req.body)) {
      // Process as batch
      const questions = req.body;
      const results = {
        success: [] as any[],
        errors: [] as any[],
      };

      for (let i = 0; i < questions.length; i++) {
        try {
          const question = await processSingleQuestion(questions[i]);
          results.success.push({
            index: i,
            question,
          });
        } catch (error: any) {
          results.errors.push({
            index: i,
            error: error.message,
            data: questions[i],
          });
        }
      }

      return res.status(201).json({
        message: `Processed ${questions.length} questions`,
        total: questions.length,
        successful: results.success.length,
        failed: results.errors.length,
        results,
      });
    }

    // Check if request body has a 'questions' property (batch format)
    if (req.body.questions && Array.isArray(req.body.questions)) {
      const questions = req.body.questions;
      const results = {
        success: [] as any[],
        errors: [] as any[],
      };

      for (let i = 0; i < questions.length; i++) {
        try {
          const question = await processSingleQuestion(questions[i]);
          results.success.push({
            index: i,
            question,
          });
        } catch (error: any) {
          results.errors.push({
            index: i,
            error: error.message,
            data: questions[i],
          });
        }
      }

      return res.status(201).json({
        message: `Processed ${questions.length} questions`,
        total: questions.length,
        successful: results.success.length,
        failed: results.errors.length,
        results,
      });
    }

    // Process as single question
    try {
      const question = await processSingleQuestion(req.body);
      return res.status(201).json({
        message: 'Question created successfully',
        question,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create question
router.post('/', async (req: Request, res: Response) => {
  try {
    const question = new Question(req.body);
    await question.save();
    await question.populate('subjectId');
    await question.populate('questionTypeId');
    res.status(201).json(question);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update question
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('subjectId')
      .populate('questionTypeId');
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete question
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

