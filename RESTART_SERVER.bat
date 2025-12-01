@echo off
title Restarting Next.js Server
color 0A

echo.
echo ========================================
echo  RESTARTING NEXT.JS SERVER
echo ========================================
echo.

echo [1/4] Stopping all Node.js processes...
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% equ 0 (
    echo       SUCCESS: Node.js processes stopped
) else (
    echo       No Node.js processes found
)

echo.
echo [2/4] Waiting 3 seconds...
timeout /t 3 /nobreak >nul
echo       Done

echo.
echo [3/4] Cleaning up lock files...
if exist "out\dev\lock" (
    del /f "out\dev\lock" 2>nul
    echo       SUCCESS: Lock file removed
) else (
    echo       No lock file found
)

if exist ".next" (
    rmdir /s /q ".next" 2>nul
    echo       SUCCESS: .next folder removed
)

echo.
echo [4/4] Starting Next.js development server...
echo.
echo ========================================
echo  SERVER STARTING - PLEASE WAIT
echo ========================================
echo.

npm run dev

pause
