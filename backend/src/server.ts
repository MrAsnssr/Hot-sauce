import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDatabase } from './config/database.js';
import questionRoutes from './routes/questions.js';
import subjectRoutes from './routes/subjects.js';
import questionTypeRoutes from './routes/questionTypes.js';
import gameRoutes from './routes/games.js';
import generateQuestionsRoutes from './routes/generateQuestions.js';
import { setupGameSocket } from './sockets/gameSocket.js';

// Load environment variables - try multiple locations
dotenv.config(); // Try current directory first
dotenv.config({ path: '.env' });
dotenv.config({ path: '../.env' });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Debug: Log environment status
console.log('📂 Current directory:', process.cwd());
console.log('🔑 OpenAI API Key:', process.env.OPENAI_API_KEY ? `Loaded (${process.env.OPENAI_API_KEY.substring(0, 10)}...)` : 'NOT FOUND');
console.log('🗄️  MongoDB URI:', process.env.MONGODB_URI ? 'Loaded' : 'Using default');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDatabase();

// Routes
app.use('/api/questions', questionRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/question-types', questionTypeRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/generate-questions', generateQuestionsRoutes);

// Health check with env status
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Arabic Trivia API is running',
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Socket.io setup
setupGameSocket(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
