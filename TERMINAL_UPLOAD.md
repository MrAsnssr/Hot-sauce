# 🖥️ Upload to GitHub via Terminal - Step by Step

## Step 1: Install Git (One Time Setup)

### Download Git:
1. Go to: https://git-scm.com/download/win
2. Click "Download for Windows"
3. Run the installer
4. **Important:** During installation, choose:
   - ✅ "Git from the command line and also from 3rd-party software"
   - ✅ "Use bundled OpenSSH"
   - ✅ "Use the OpenSSL library"
   - ✅ "Checkout Windows-style, commit Unix-style line endings"
5. Click "Next" through the rest (defaults are fine)
6. Click "Install"
7. **Restart PowerShell** after installation

### Verify Installation:
```powershell
git --version
```
You should see something like: `git version 2.xx.x`

---

## Step 2: Push Your Code

### Open PowerShell in your project folder:

**Option A: Right-click method**
1. Navigate to: `C:\Projects\Game i dont have name for yet`
2. Right-click in the folder
3. Select "Open in Terminal" or "Open PowerShell window here"

**Option B: Command method**
1. Open PowerShell
2. Type:
```powershell
cd "C:\Projects\Game i dont have name for yet"
```

### Run These Commands (One by One):

```powershell
# 1. Initialize git repository
git init

# 2. Add your GitHub repository
git remote add origin https://github.com/MrAsnssr/Hot-sauce.git

# 3. Add all files (except those in .gitignore)
git add .

# 4. Commit your files
git commit -m "Initial commit: Arabic Trivia Game with Extra Sauce"

# 5. Set main branch
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

---

## Step 3: Authentication

When you run `git push`, you'll be asked for credentials:

### Option A: Personal Access Token (Recommended)
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: "Hot Sauce Game"
4. Select scopes: ✅ `repo` (full control)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. When asked for password, paste the token

### Option B: GitHub Credential Manager
- First time: Enter username and password
- Windows will save it for future use

---

## 🚨 Troubleshooting

### "git: command not found"
- Git is not installed
- Install from: https://git-scm.com/download/win
- Restart PowerShell after installation

### "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/MrAsnssr/Hot-sauce.git
```

### "Authentication failed"
- Use Personal Access Token instead of password
- Generate token: https://github.com/settings/tokens

### "Repository not found"
- Make sure you're logged into GitHub
- Check repository name: `Hot-sauce` (case-sensitive)
- Make sure repository exists on GitHub

### "Permission denied"
- Check your GitHub username is correct
- Use Personal Access Token with `repo` scope

---

## ✅ Success!

After `git push` completes, you should see:
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), done.
To https://github.com/MrAsnssr/Hot-sauce.git
 * [new branch]      main -> main
```

**Check your GitHub:** https://github.com/MrAsnssr/Hot-sauce

You should see all your files! 🎉

---

## 📋 Quick Command Reference

```powershell
# Check if git is installed
git --version

# Initialize repository
git init

# Add remote
git remote add origin https://github.com/MrAsnssr/Hot-sauce.git

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Your message here"

# Push
git push -u origin main

# Check what's uploaded
git ls-files
```

---

## 🎯 Next Steps After Upload

1. ✅ Verify files on GitHub
2. ✅ Deploy to Render (see DEPLOYMENT.md)
3. ✅ Your game goes live!

