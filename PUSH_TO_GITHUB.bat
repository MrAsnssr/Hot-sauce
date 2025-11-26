@echo off
echo ========================================
echo Pushing to GitHub: Hot-sauce
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Initializing git...
git init

echo.
echo Step 2: Adding remote repository...
git remote add origin https://github.com/MrAsnssr/Hot-sauce.git

echo.
echo Step 3: Adding all files...
git add .

echo.
echo Step 4: Committing...
git commit -m "Initial commit: Arabic Trivia Game with Extra Sauce"

echo.
echo Step 5: Setting main branch...
git branch -M main

echo.
echo Step 6: Pushing to GitHub...
echo (You'll be asked for GitHub username and password/token)
git push -u origin main

echo.
echo ========================================
echo Done! Check https://github.com/MrAsnssr/Hot-sauce
echo ========================================
pause

