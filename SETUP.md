# Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Install root dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

## Configuration

1. Set up backend environment:
```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` with your MongoDB connection:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/arabic-trivia
NODE_ENV=development
```

3. (Optional) Set up frontend environment:
Create `frontend/.env` if you need to customize the socket URL:
```
VITE_SOCKET_URL=http://localhost:5000
```

## Database Setup

1. Make sure MongoDB is running

2. Seed initial data (optional):
```bash
cd backend
npm run seed
```

This will create:
- Sample subjects (History, Science, Sports, Geography, Literature)
- Sample question types (Multiple Choice, True/False, Fill in the Blank)
- Sample questions

## Running the Application

### Development Mode

From the root directory:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

### Individual Services

Frontend only:
```bash
npm run dev:frontend
```

Backend only:
```bash
npm run dev:backend
```

## Access Points

- **Game Page**: http://localhost:3000/
- **Admin Panel**: http://localhost:3000/admin
- **Host Controls**: http://localhost:3000/host

## Features

### Admin Panel
- Manage questions (CRUD)
- Manage subjects (CRUD)
- Manage question types (CRUD)

### Host Controls
- Enable/disable Extra Sauce system
- Control game flow (start, pause, resume, reset)
- Configure point distribution

### Game Features
- Two-team gameplay
- Subject and question type selection
- Extra Sauce powers (positive and negative)
- Real-time multiplayer via Socket.io
- Timer system
- Score tracking

## Adding New Power Types

To add new power types, edit `frontend/src/types/power.registry.ts`:

```typescript
PowerRegistry.register({
  id: 'your_power_id',
  name: 'Power Name',
  nameAr: 'اسم القوة',
  description: 'Description',
  descriptionAr: 'الوصف',
  effect: 'your_effect_type',
  value: 10, // optional
  isPositive: true, // or false
  color: '#hexcolor',
});
```

Then add the effect handler in `frontend/src/utils/gameLogic.ts` in the `applyPowerEffect` function.

## Adding New Question Types

1. Add via Admin Panel at `/admin`
2. Or directly in database
3. The system will automatically support the new type

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access if using remote MongoDB

### Socket.io Connection Issues
- Check that backend is running on port 5000
- Verify CORS settings in `backend/src/server.ts`
- Check browser console for connection errors

### Build Issues
- Clear node_modules and reinstall
- Check Node.js version (should be 18+)
- Verify TypeScript version compatibility

