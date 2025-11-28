# ⚡ Quick Deploy - 5 Steps

## 1️⃣ Push to GitHub
```bash
# Using GitHub Desktop (easiest):
# 1. Download: https://desktop.github.com/
# 2. Add repository: C:\Projects\Game i dont have name for yet
# 3. Publish to: MrAsnssr/Hot-sauce
```

## 2️⃣ MongoDB Atlas
- Go to: https://www.mongodb.com/cloud/atlas
- Create free cluster
- Copy connection string
- Whitelist IP: `0.0.0.0/0` (Allow from anywhere)

## 3️⃣ Deploy Backend (Render)
- Go to: https://render.com
- New → Web Service
- Connect: `MrAsnssr/Hot-sauce`
- Settings:
  - Root: `backend`
  - Build: `npm install && npm run build`
  - Start: `npm start`
- Env Vars:
  ```
  PORT=10000
  MONGODB_URI=your_mongodb_uri
  NODE_ENV=production
  FRONTEND_URL=(add after step 4)
  ```

## 4️⃣ Deploy Frontend (Render)
- New → Static Site
- Connect: `MrAsnssr/Hot-sauce`
- Settings:
  - Root: `frontend`
  - Build: `npm install && npm run build`
  - Publish: `frontend/dist`
- Env Var:
  ```
  VITE_SOCKET_URL=your_backend_url
  ```

## 5️⃣ Update URLs
- Backend: Update `FRONTEND_URL` with frontend URL
- Done! 🎉

---

**Full guide:** See `DEPLOY_NOW.md`

