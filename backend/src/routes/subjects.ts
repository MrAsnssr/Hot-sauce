import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';

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
    const subjectId = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ error: 'Invalid subject ID format' });
    }
    
    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    // Delete all questions associated with this subject
    const questionsDeleted = await Question.deleteMany({ subjectId: new mongoose.Types.ObjectId(subjectId) });
    console.log(`Deleted ${questionsDeleted.deletedCount} questions for subject ${subjectId}`);
    
    // Delete the subject
    await Subject.findByIdAndDelete(subjectId);
    
    res.json({ 
      message: 'Subject deleted successfully',
      questionsDeleted: questionsDeleted.deletedCount 
    });
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: error.message || 'Failed to delete subject' });
  }
});

export default router;

