@echo off
echo Stopping all Node.js processes...
taskkill /F /IM node.exe /T 2>nul

echo Waiting for processes to close...
timeout /t 3 /nobreak >nul

echo Removing lock file...
if exist "out\dev\lock" del /f "out\dev\lock"

echo.
echo Starting Next.js development server...
echo.
npm run dev
