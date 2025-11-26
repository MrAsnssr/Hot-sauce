import express, { Request, Response } from 'express';
import Subject from '../models/Subject.js';

const router = express.Router();

// Get all subjects
router.get('/', async (req: Request, res: Response) => {
  try {
    const subjects = await Subject.find().sort({ nameAr: 1 });
    res.json(subjects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get subject by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create subject
router.post('/', async (req: Request, res: Response) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update subject
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete subject
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json({ message: 'Subject deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

