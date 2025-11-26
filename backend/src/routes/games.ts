import express, { Request, Response } from 'express';
import Game from '../models/Game.js';
import Question from '../models/Question.js';

const router = express.Router();

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

