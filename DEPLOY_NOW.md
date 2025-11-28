# 🚀 Deploy Your Game to the Web - Step by Step

## Quick Overview
1. Push code to GitHub ✅
2. Deploy Backend to Render (free)
3. Deploy Frontend to Render (free)
4. Set environment variables
5. Done! 🎉

---

## Step 1: Push Code to GitHub

### Option A: Using GitHub Desktop (Easiest)
1. Download: https://desktop.github.com/
2. Install and sign in
3. **File** → **Add Local Repository**
4. Browse to: `C:\Projects\Game i dont have name for yet`
5. Click "Add repository"
6. Type commit message: "Ready for deployment"
7. Click "Commit to main"
8. Click "Publish repository" (top right)
9. Repository name: `Hot-sauce`
10. Click "Publish repository"

### Option B: Using Command Line
```powershell
cd "C:\Projects\Game i dont have name for yet"
git init
git remote add origin https://github.com/MrAsnssr/Hot-sauce.git
git add .
git commit -m "Ready for deployment"
git branch -M main
git push -u origin main
```

**✅ Verify:** Go to https://github.com/MrAsnssr/Hot-sauce and see your files

---

## Step 2: Set Up MongoDB Atlas (Free Database)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create a new cluster (Free tier - M0)
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/arabic-trivia`)
6. Replace `<password>` with your database password
7. **Important:** Click **"Network Access"** → **"Add IP Address"** → **"Allow Access from Anywhere"** (0.0.0.0/0)
8. Save this connection string - you'll need it!

**Your MongoDB URI should look like:**
```
mongodb+srv://Asnssr:YOUR_PASSWORD@hotsauce.kxdewwm.mongodb.net/arabic-trivia?retryWrites=true&w=majority
```

---

## Step 3: Deploy Backend to Render

1. Go to: https://render.com
2. Sign up (use GitHub to connect - it's easier)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository: `MrAsnssr/Hot-sauce`
5. Configure settings:
   - **Name:** `hot-sauce-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or Starter if you want faster)
6. Click **"Advanced"** and add Environment Variables:
   ```
   PORT=10000
   MONGODB_URI=mongodb+srv://Asnssr:YOUR_PASSWORD@hotsauce.kxdewwm.mongodb.net/arabic-trivia?retryWrites=true&w=majority
   NODE_ENV=production
   FRONTEND_URL=https://hot-sauce-frontend.onrender.com
   ```
   *(We'll update FRONTEND_URL after frontend deploys)*
7. Click **"Create Web Service"**
8. Wait 5-10 minutes for deployment
9. **Copy your backend URL** (e.g., `https://hot-sauce-backend.onrender.com`)

---

## Step 4: Deploy Frontend to Render

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository: `MrAsnssr/Hot-sauce`
3. Configure settings:
   - **Name:** `hot-sauce-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
4. Add Environment Variable:
   ```
   VITE_SOCKET_URL=https://hot-sauce-backend.onrender.com
   ```
   *(Use your actual backend URL from Step 3)*
5. Click **"Create Static Site"**
6. Wait 3-5 minutes for deployment
7. **Copy your frontend URL** (e.g., `https://hot-sauce-frontend.onrender.com`)

---

## Step 5: Update Environment Variables

### Update Backend:
1. Go to your backend service in Render
2. Click **"Environment"** tab
3. Update `FRONTEND_URL` with your frontend URL from Step 4
4. Click **"Save Changes"** (auto-redeploys)

### Update Frontend (if needed):
1. Go to your frontend service in Render
2. Click **"Environment"** tab
3. Verify `VITE_SOCKET_URL` is correct
4. If you changed it, click **"Save Changes"**

---

## Step 6: Test Your Deployment! 🎉

1. Open your frontend URL in a browser
2. Try creating a game
3. Check if questions load
4. Test the admin panel

**If something doesn't work:**
- Check Render logs (click on your service → "Logs" tab)
- Check browser console (F12) for errors
- Verify environment variables are set correctly

---

## 🎯 Your Live URLs

- **Frontend:** `https://hot-sauce-frontend.onrender.com`
- **Backend API:** `https://hot-sauce-backend.onrender.com`
- **Admin Panel:** `https://hot-sauce-frontend.onrender.com/admin`

---

## ⚠️ Important Notes

### Render Free Tier Limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (wake-up time)
- After that, it's fast until next inactivity period

### To Keep Services Active:
- Use a service like UptimeRobot (free) to ping your URLs every 10 minutes
- Or upgrade to Render Starter plan ($7/month) for always-on

### Security:
- ✅ Never commit `.env` files (already in `.gitignore`)
- ✅ MongoDB password is in environment variables (secure)
- ✅ Frontend URL is whitelisted in backend CORS

---

## 🆘 Troubleshooting

### Backend won't start:
- Check logs in Render dashboard
- Verify `PORT=10000` is set
- Check MongoDB connection string is correct
- Make sure MongoDB IP whitelist includes `0.0.0.0/0`

### Frontend can't connect:
- Check `VITE_SOCKET_URL` matches backend URL
- Verify backend CORS allows frontend URL
- Check browser console for errors

### Socket.io not working:
- Both URLs must use HTTPS (not HTTP)
- Check CORS settings in backend
- Verify WebSocket support (Render supports it)

### Questions not loading:
- Check MongoDB connection
- Verify database has questions (run seed scripts locally first)
- Check backend logs for errors

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB IP whitelist configured (0.0.0.0/0)
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Environment variables set correctly
- [ ] Backend URL updated in frontend
- [ ] Frontend URL updated in backend
- [ ] Game tested and working
- [ ] Admin panel accessible

---

## 🎉 You're Done!

Your game is now live on the internet! Share the frontend URL with your friends and start playing!

**Need help?** Check the logs in Render dashboard or review the error messages.

