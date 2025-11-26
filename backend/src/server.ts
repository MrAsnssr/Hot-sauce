import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDatabase } from './config/database.js';
import questionRoutes from './routes/questions.js';
import subjectRoutes from './routes/subjects.js';
import questionTypeRoutes from './routes/questionTypes.js';
import gameRoutes from './routes/games.js';
import generateQuestionsRoutes from './routes/generateQuestions.js';
import { setupGameSocket } from './sockets/gameSocket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Render uses port from PORT env var, default to 5000 for local dev

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Arabic Trivia API is running' });
});

// Socket.io setup
setupGameSocket(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

