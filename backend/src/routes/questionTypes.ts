import express, { Request, Response } from 'express';
import QuestionType from '../models/QuestionType.js';

const router = express.Router();

// Get all question types
router.get('/', async (req: Request, res: Response) => {
  try {
    const questionTypes = await QuestionType.find().sort({ nameAr: 1 });
    res.json(questionTypes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get question type by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const questionType = await QuestionType.findById(req.params.id);
    
    if (!questionType) {
      return res.status(404).json({ error: 'Question type not found' });
    }
    
    res.json(questionType);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create question type
router.post('/', async (req: Request, res: Response) => {
  try {
    const questionType = new QuestionType(req.body);
    await questionType.save();
    res.status(201).json(questionType);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update question type
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const questionType = await QuestionType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!questionType) {
      return res.status(404).json({ error: 'Question type not found' });
    }
    
    res.json(questionType);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete question type
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const questionType = await QuestionType.findByIdAndDelete(req.params.id);
    
    if (!questionType) {
      return res.status(404).json({ error: 'Question type not found' });
    }
    
    res.json({ message: 'Question type deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

