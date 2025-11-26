# Free Deployment Guide

## Option 1: Render (100% Free) - Recommended

### Step 1: Prepare MongoDB Atlas (Free Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (Free tier - M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/arabic-trivia`)
6. Replace `<password>` with your database password
7. Save this connection string - you'll need it!

### Step 2: Prepare GitHub Repository

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/arabic-trivia-game.git
git push -u origin main
```

### Step 3: Deploy Backend on Render

1. Go to https://render.com and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `arabic-trivia-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `PORT` = `10000` (Render uses this port)
   - `MONGODB_URI` = (your MongoDB Atlas connection string)
   - `OPENAI_API_KEY` = (your OpenAI key, optional)
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (we'll add this after frontend deploys)
6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy the URL (e.g., `https://arabic-trivia-backend.onrender.com`)

### Step 4: Deploy Frontend on Render

1. In Render dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `arabic-trivia-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Add Environment Variable:
   - `VITE_SOCKET_URL` = (your backend URL from step 3)
5. Click "Create Static Site"
6. Wait for deployment
7. Copy the frontend URL

### Step 5: Update Backend with Frontend URL

1. Go back to your backend service in Render
2. Go to "Environment" tab
3. Update `FRONTEND_URL` with your frontend URL
4. Save changes (auto-redeploys)

### Step 6: Update Frontend Socket URL

1. Go to frontend service in Render
2. Go to "Environment" tab
3. Update `VITE_SOCKET_URL` with your backend URL
4. Save changes (auto-redeploys)

**Done! Your game is live! 🎉**

---

## Option 2: Vercel (Frontend) + Render (Backend) - Fastest Frontend

### Step 1-2: Same as above (MongoDB + GitHub)

### Step 3: Deploy Backend on Render
- Follow Step 3 from Option 1

### Step 4: Deploy Frontend on Vercel

1. Go to https://vercel.com and sign up (free)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_SOCKET_URL` = (your Render backend URL)
6. Click "Deploy"
7. Wait 2-3 minutes
8. Your site is live! (e.g., `https://arabic-trivia-game.vercel.app`)

### Step 5: Update Backend CORS
- Update `FRONTEND_URL` in Render backend with your Vercel URL

**Done! Faster frontend with Vercel! ⚡**

---

## Option 3: Railway (Free Trial, Then $5/month)

### Step 1: MongoDB Atlas (Same as above)

### Step 2: Deploy on Railway

1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add MongoDB service:
   - Click "+ New" → "Database" → "Add MongoDB"
5. Configure Backend:
   - Click "+ New" → "GitHub Repo"
   - Select your repo
   - Set Root Directory: `backend`
   - Railway auto-detects Node.js
6. Add Environment Variables:
   - `MONGODB_URI` = (from Railway MongoDB service, or use Atlas)
   - `OPENAI_API_KEY` = (optional)
   - `FRONTEND_URL` = (add after frontend deploys)
7. Deploy Frontend:
   - Click "+ New" → "GitHub Repo" (same repo)
   - Set Root Directory: `frontend`
   - Add Environment Variable: `VITE_SOCKET_URL` = (backend URL)
8. Railway auto-generates URLs for both services

**Done! Professional hosting! 🚀**

---

## Important Files to Create

### backend/railway.json (for Railway)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### backend/render.yaml (for Render)
```yaml
services:
  - type: web
    name: arabic-trivia-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: PORT
        value: 10000
      - key: NODE_ENV
        value: production
```

### frontend/vercel.json (for Vercel)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## Troubleshooting

### Backend won't start on Render
- Make sure `PORT` env var is set to `10000`
- Check build logs in Render dashboard
- Ensure `startCommand` is `npm start` (not `npm run dev`)

### Frontend can't connect to backend
- Check `VITE_SOCKET_URL` is set correctly
- Make sure backend CORS allows frontend URL
- Check browser console for errors

### MongoDB connection fails
- Verify connection string is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Render)
- Ensure password doesn't have special characters (or URL encode them)

### Socket.io not working
- Make sure both frontend and backend URLs use HTTPS
- Check WebSocket support on hosting platform
- Verify CORS settings allow WebSocket connections

---

## Cost Summary

| Option | Frontend | Backend | Database | Total |
|--------|----------|---------|----------|-------|
| Render | Free | Free* | Free (Atlas) | **$0/month** |
| Vercel + Render | Free | Free* | Free (Atlas) | **$0/month** |
| Railway | Free trial | Free trial | Free (Atlas) | **$5/month** after trial |

*Render free tier: Services spin down after 15 min inactivity (first request takes ~30s to wake up)

---

## Quick Start Commands

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Build for production
cd backend && npm run build
cd ../frontend && npm run build

# 3. Test production build locally
cd backend && npm start
# Frontend: serve the dist folder
```

