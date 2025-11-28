import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Game from '../models/Game.js';
import Question from '../models/Question.js';
import Subject from '../models/Subject.js';
import QuestionType from '../models/QuestionType.js';

const router = express.Router();

// Get random question for local/temp games (no game ID required)
router.post('/temp/question', async (req: Request, res: Response) => {
  try {
    const { subjectId, questionTypeId, difficulty } = req.body;
    const filter: any = {};
    
    // Handle subjectId - could be ObjectId or string
    if (subjectId) {
      // Check if it's a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(subjectId)) {
        filter.subjectId = new mongoose.Types.ObjectId(subjectId);
      } else {
        // Try to find subject by name or other identifier
        const subject = await Subject.findOne({ 
          $or: [
            { name: subjectId },
            { nameAr: subjectId },
            { _id: subjectId }
          ]
        });
        if (subject) {
          filter.subjectId = subject._id;
        } else {
          // If can't find subject, don't filter by it
          console.warn(`Subject not found: ${subjectId}`);
        }
      }
    }
    
    // Handle questionTypeId - could be ObjectId or string (hardcoded ID like "four-options", "fill-blank", etc.)
    if (questionTypeId) {
      // Check if it's a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(questionTypeId)) {
        filter.questionTypeId = new mongoose.Types.ObjectId(questionTypeId);
      } else {
        // Hardcoded question type IDs are stored directly as strings in the question documents
        // So we can filter directly by the string
        filter.questionTypeId = questionTypeId;
        console.log(`Using hardcoded questionTypeId: ${questionTypeId}`);
      }
    }
    
    if (difficulty) filter.difficulty = difficulty;

    let questions = await Question.find(filter);
    
    // If no questions found with type filter, try without type filter (just subject)
    if (questions.length === 0 && questionTypeId && filter.questionTypeId) {
      console.log(`No questions found with type filter, trying without type...`);
      const subjectOnlyFilter: any = {};
      if (filter.subjectId) subjectOnlyFilter.subjectId = filter.subjectId;
      if (difficulty) subjectOnlyFilter.difficulty = difficulty;
      questions = await Question.find(subjectOnlyFilter);
    }
    
    // If still no questions, try with just difficulty or no filters
    if (questions.length === 0 && (filter.subjectId || filter.questionTypeId)) {
      console.log(`No questions found with filters, trying with minimal filters...`);
      const minimalFilter: any = {};
      if (difficulty) minimalFilter.difficulty = difficulty;
      questions = await Question.find(minimalFilter);
    }
    
    if (questions.length === 0) {
      // Log why no questions were found for debugging
      console.log('No questions found in database at all');
      console.log('Request params:', { subjectId, questionTypeId, difficulty });
      console.log('Applied filter:', filter);
      const totalQuestions = await Question.countDocuments();
      console.log('Total questions in DB:', totalQuestions);
      
      // Return a more helpful error instead of mock question
      return res.status(404).json({ 
        error: 'No questions found',
        message: 'لا توجد أسئلة متاحة في قاعدة البيانات. يرجى إنشاء أسئلة من لوحة الإدارة أولاً.',
        suggestion: 'Go to Admin panel and generate questions for subjects',
        filter: filter,
        totalInDb: totalQuestions
      });
    }
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    await randomQuestion.populate('subjectId');
    await randomQuestion.populate('questionTypeId');
    
    // Convert to plain object and ensure id field exists
    const questionObj = randomQuestion.toObject();
    questionObj.id = questionObj._id.toString();
    
    res.json(questionObj);
  } catch (error: any) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all games
router.get('/', async (req: Request, res: Response) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get game by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create game
router.post('/', async (req: Request, res: Response) => {
  try {
    const game = new Game(req.body);
    await game.save();
    res.status(201).json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update game
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get random question
router.post('/:id/question', async (req: Request, res: Response) => {
  try {
    const { subjectId, questionTypeId, difficulty } = req.body;
    const filter: any = {};
    
    if (subjectId) filter.subjectId = subjectId;
    if (questionTypeId) filter.questionTypeId = questionTypeId;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter);
    
    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions found' });
    }
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    await randomQuestion.populate('subjectId');
    await randomQuestion.populate('questionTypeId');
    
    res.json(randomQuestion);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

