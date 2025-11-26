# 🌶️ Extra Sauce - Arabic Trivia Game

A fun, team-based trivia game with Arabic support, featuring subject/question type selection and Extra Sauce powers!

## 🎮 Game Modes

### 🍽️ Local Mode (طبق مشترك)
- Everyone plays on the same device
- Perfect for parties and gatherings
- One person reads questions aloud

### 🍝 Online Mode (وليمة جماعية)
- Multiplayer via shareable links
- Real-time synchronization
- Play with friends anywhere

## ✨ Features

- **Two-team gameplay** with alternating turns
- **Subject & Question Type selection** - teams pick what to play
- **Extra Sauce system** - 14 powers (7 positive, 7 negative)
- **Admin panel** for managing questions, subjects, and types
- **ChatGPT integration** - Generate 1000 questions per category automatically
- **Real-time multiplayer** via Socket.io
- **Beautiful Arabic RTL UI** with cooking theme

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install separately
cd frontend && npm install
cd ../backend && npm install
```

### Setup

1. **Backend Environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

2. **Start Development Servers:**
   ```bash
   # From root directory
   npm run dev
   
   # Or separately
   npm run dev:frontend  # http://localhost:3000
   npm run dev:backend   # http://localhost:5000
   ```

3. **Seed Sample Data (Optional):**
   ```bash
   cd backend
   npm run seed
   ```

## 📁 Project Structure

```
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── backend/           # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── sockets/
│   │   └── server.ts
│   └── package.json
└── package.json       # Root package.json
```

## 🎯 Game Flow

1. **Team A** picks a subject
2. **Team B** picks a question type
3. **Team A** (subject picker) chooses Extra Sauce (optional)
4. **Both teams** answer the question
5. Points awarded based on correctness and sauce effects
6. Next round - roles alternate

## 🌶️ Extra Sauce Powers

### Positive Powers ⚡
- +10 seconds
- Remove incorrect option
- Alternative question
- Double points
- Change question type
- Steal point from opponent
- Ask friend (Joker)

### Negative Sauces 🔥
- -10 seconds
- Higher difficulty question
- Blind guess (no options)
- Skip turn
- Lose point
- Mystery question (no hints)
- Reverse time to opponent

## 🛠️ Admin Features

- **Question Management** - CRUD operations
- **Subject Management** - Add/edit categories
- **Question Type Management** - Configure question formats
- **ChatGPT Integration** - Generate 1000 questions per category
- **Game Controls** - Start, pause, reset games

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy (Render)

1. Push code to GitHub
2. Connect to Render
3. Deploy backend as Web Service
4. Deploy frontend as Static Site
5. Set environment variables
6. Done! 🎉

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
NODE_ENV=development
OPENAI_API_KEY=sk-... (optional, for question generation)
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_SOCKET_URL=http://localhost:5000
```

## 🧪 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Socket.io
- **Database:** MongoDB with Mongoose
- **AI:** OpenAI GPT-4 (for question generation)
- **Deployment:** Render, Vercel

## 📄 License

MIT

## 👨‍🍳 Made with ❤️ and 🌶️

Enjoy the game!
