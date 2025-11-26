# Fix Git Setup - Run These Commands

## Step 1: Set Your Git Identity

Run these commands (replace with your info):

```powershell
git config --global user.name "MrAsnssr"
git config --global user.email "your-email@example.com"
```

**Use your GitHub email or any email you want.**

## Step 2: Fix Remote (Already Exists)

```powershell
git remote remove origin
git remote add origin https://github.com/MrAsnssr/Hot-sauce.git
```

## Step 3: Now Commit and Push

```powershell
git add .
git commit -m "Initial commit: Arabic Trivia Game"
git branch -M main
git push -u origin main
```

---

## Complete Sequence (Copy & Paste All):

```powershell
# Set your identity
git config --global user.name "MrAsnssr"
git config --global user.email "your-email@example.com"

# Fix remote
git remote remove origin
git remote add origin https://github.com/MrAsnssr/Hot-sauce.git

# Add, commit, and push
git add .
git commit -m "Initial commit: Arabic Trivia Game"
git branch -M main
git push -u origin main
```

**Replace `your-email@example.com` with your actual email!**

