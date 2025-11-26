import express, { Request, Response } from 'express';
import Question from '../models/Question.js';

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

