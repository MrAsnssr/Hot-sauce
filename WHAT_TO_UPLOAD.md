# 📦 What Files to Upload to GitHub

## ✅ UPLOAD THESE (All Source Code):

### Root Folder:
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `README.md`
- ✅ `DEPLOYMENT.md`
- ✅ `SETUP.md`
- ✅ `SETUP_MONGODB.md`
- ✅ `GITHUB_SETUP.md`
- ✅ `QUICK_UPLOAD.md`
- ✅ `.gitignore`
- ✅ `PUSH_TO_GITHUB.bat`

### Frontend Folder (`frontend/`):
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `index.html`
- ✅ `vite.config.ts`
- ✅ `tsconfig.json`
- ✅ `tsconfig.node.json`
- ✅ `tailwind.config.js`
- ✅ `postcss.config.js`
- ✅ `vercel.json`
- ✅ **`src/` folder** (ALL files inside)
  - ✅ `src/components/`
  - ✅ `src/pages/`
  - ✅ `src/types/`
  - ✅ `src/hooks/`
  - ✅ `src/utils/`
  - ✅ `src/App.tsx`
  - ✅ `src/main.tsx`
  - ✅ `src/index.css`

### Backend Folder (`backend/`):
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `tsconfig.json`
- ✅ `render.yaml`
- ✅ **`src/` folder** (ALL files inside)
  - ✅ `src/models/`
  - ✅ `src/routes/`
  - ✅ `src/sockets/`
  - ✅ `src/config/`
  - ✅ `src/scripts/`
  - ✅ `src/server.ts`

---

## ❌ DO NOT UPLOAD (Already in .gitignore):

### Never Upload:
- ❌ `node_modules/` (too large, will be installed via npm)
- ❌ `.env` files (contains passwords!)
- ❌ `info.env` (contains passwords!)
- ❌ `dist/` folders (build outputs)
- ❌ `*.log` files
- ❌ `.vscode/` folder
- ❌ `.idea/` folder

---

## 🎯 Quick Answer:

**Upload EVERYTHING except:**
1. `node_modules/` folders (both frontend and backend)
2. `.env` and `info.env` files
3. `dist/` folders (if they exist)

**If using GitHub Desktop or Git command line:**
- ✅ Just upload everything - `.gitignore` will automatically exclude the bad files!

**If using GitHub website (manual upload):**
- ✅ Upload all folders EXCEPT `node_modules` folders
- ✅ Skip `.env` and `info.env` files

---

## 📋 Checklist:

### Frontend Files to Upload:
- [ ] `frontend/package.json`
- [ ] `frontend/src/` (entire folder)
- [ ] `frontend/index.html`
- [ ] `frontend/vite.config.ts`
- [ ] `frontend/tsconfig.json`
- [ ] `frontend/tailwind.config.js`
- [ ] `frontend/postcss.config.js`
- [ ] `frontend/vercel.json`
- [ ] Skip `frontend/node_modules/`
- [ ] Skip `frontend/dist/` (if exists)

### Backend Files to Upload:
- [ ] `backend/package.json`
- [ ] `backend/src/` (entire folder)
- [ ] `backend/tsconfig.json`
- [ ] `backend/render.yaml`
- [ ] Skip `backend/node_modules/`
- [ ] Skip `backend/.env` and `backend/info.env`
- [ ] Skip `backend/dist/` (if exists)

### Root Files to Upload:
- [ ] `package.json`
- [ ] `README.md`
- [ ] All `.md` files
- [ ] `.gitignore`
- [ ] Skip `node_modules/`
- [ ] Skip `info.env`

---

## 💡 Pro Tip:

**Best Method:** Use GitHub Desktop
- It reads `.gitignore` automatically
- You just select the folder and it knows what to exclude
- No manual filtering needed!

---

## 🚀 After Upload:

Once uploaded, anyone can:
1. Clone your repo
2. Run `npm install` in frontend and backend
3. Create their own `.env` files
4. Run the game!

The `node_modules` will be installed fresh on each machine, so you don't need to upload them.

