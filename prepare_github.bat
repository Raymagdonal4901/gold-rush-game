@echo off
echo ===================================================
echo      GOLD RUSH - GITHUB DEPLOYMENT ASSISTANT
echo ===================================================
echo.
echo [1] Checking for sensitive files...
if exist .env (
    echo  - .env found (Good, ensuring it is ignored)
)
echo.

echo [2] Initializing Git Repository...
if not exist .git (
    git init
    echo  - Git repository initialized.
) else (
    echo  - Git repository already exists.
)
echo.

echo [3] Staging files...
git add .
echo  - Files staged.
echo.

echo [4] Committing changes...
set /p commit_msg="Enter commit message (Press Enter for default 'First Commit'): "
if "%commit_msg%"=="" set commit_msg=First Commit
git commit -m "%commit_msg%"
echo.

echo [5] Setting up Remote...
echo.
echo Please create a new repository on GitHub (https://github.com/new)
echo AND COPY THE HTTPS URL (e.g., https://github.com/username/repo.git)
echo.
set /p repo_url="Paste your Repository URL here: "
echo.

git remote add origin %repo_url%
git branch -M main
echo.

echo [6] Pushing to GitHub...
git push -u origin main

echo.
echo ===================================================
echo      DEPLOYMENT COMPLETE! (If no errors above)
echo ===================================================
pause
