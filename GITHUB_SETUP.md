# Push Code to GitHub - Step by Step

## Your Repository
**URL:** https://github.com/MrAsnssr/Hot-sauce.git

## Option 1: Install Git and Push (Recommended)

### Step 1: Install Git
1. Download Git: https://git-scm.com/download/win
2. Install with default settings
3. Restart your terminal/PowerShell

### Step 2: Push Your Code

Open PowerShell in your project folder and run:

```powershell
# Navigate to project
cd "C:\Projects\Game i dont have name for yet"

# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/MrAsnssr/Hot-sauce.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: Arabic Trivia Game with Extra Sauce"

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** You'll be asked for your GitHub username and password (use a Personal Access Token, not your password).

---

## Option 2: Use GitHub Desktop (Easier)

### Step 1: Install GitHub Desktop
1. Download: https://desktop.github.com/
2. Sign in with your GitHub account

### Step 2: Add Repository
1. Click "File" → "Add Local Repository"
2. Browse to: `C:\Projects\Game i dont have name for yet`
3. Click "Add repository"

### Step 3: Publish
1. Click "Publish repository"
2. Name: `Hot-sauce`
3. Make sure "Keep this code private" is unchecked (or checked if you want private)
4. Click "Publish repository"

---

## Option 3: Manual Upload via GitHub Website

### Step 1: Prepare Files
Make sure these files are ready:
- All source code files
- `package.json` files
- Configuration files
- **DO NOT include:** `.env` files, `node_modules`, `dist` folders

### Step 2: Upload
1. Go to https://github.com/MrAsnssr/Hot-sauce
2. Click "uploading an existing file"
3. Drag and drop your project folder (excluding `node_modules` and `.env`)
4. Add commit message: "Initial commit"
5. Click "Commit changes"

---

## After Pushing to GitHub

### Deploy to Render

1. **Go to Render:** https://render.com
2. **Sign up/Login** with GitHub
3. **Deploy Backend:**
   - New + → Web Service
   - Connect repository: `MrAsnssr/Hot-sauce`
   - Settings:
     - Name: `hot-sauce-backend`
     - Root Directory: `backend`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
   - Environment Variables:
     ```
     PORT=10000
     MONGODB_URI=mongodb+srv://Asnssr:Asd1asd2@hotsauce.kxdewwm.mongodb.net/arabic-trivia?retryWrites=true&w=majority
     NODE_ENV=production
     FRONTEND_URL=(add after frontend deploys)
     ```

4. **Deploy Frontend:**
   - New + → Static Site
   - Connect repository: `MrAsnssr/Hot-sauce`
   - Settings:
     - Name: `hot-sauce-frontend`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `frontend/dist`
   - Environment Variable:
     ```
     VITE_SOCKET_URL=(your backend URL from step 3)
     ```

5. **Update Backend:**
   - Go to backend service
   - Environment tab
   - Update `FRONTEND_URL` with frontend URL
   - Save

---

## Important: Files to Exclude

Make sure `.gitignore` includes:
- `.env` files (contains passwords!)
- `node_modules/`
- `dist/` folders
- `*.log` files

Your `.gitignore` is already set up correctly! ✅

---

## Quick Checklist

- [ ] Git installed OR GitHub Desktop installed
- [ ] Code pushed to GitHub
- [ ] Repository is public (or you have Render connected to private repos)
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Environment variables set
- [ ] Game is live! 🎉

---

## Need Help?

If you get stuck:
1. **Git not found:** Install Git from https://git-scm.com/download/win
2. **Authentication error:** Use GitHub Personal Access Token instead of password
3. **Push rejected:** Make sure repository is empty or use `git push -f` (careful!)

