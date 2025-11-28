@echo off
echo ========================================
echo Committing and Pushing Changes
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Checking git status...
git status

echo.
echo Step 2: Adding all changes...
git add .

echo.
echo Step 3: Committing changes...
git commit -m "Convert from team system to free-for-all with turn-based selection"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Done! Check https://github.com/MrAsnssr/Hot-sauce
echo ========================================
pause

