@echo off
title FORCE RESTART - Next.js Server
color 0E

echo.
echo ============================================
echo  FORCE RESTART - KILLING ALL NODE PROCESSES
echo ============================================
echo.

echo [Step 1] Force killing ALL Node.js processes...
taskkill /F /IM node.exe /T
echo.

echo [Step 2] Waiting 5 seconds for cleanup...
timeout /t 5 /nobreak
echo.

echo [Step 3] Removing all lock and cache files...
if exist "out" rmdir /s /q "out"
if exist ".next" rmdir /s /q ".next"
echo       All cache files removed
echo.

echo [Step 4] Starting fresh Next.js server...
echo.
echo ============================================
echo  STARTING SERVER - PLEASE WAIT
echo ============================================
echo.

start /B npm run dev

echo.
echo ============================================
echo  Server is starting in the background
echo  Wait 10 seconds then open:
echo  http://localhost:3000
echo ============================================
echo.

timeout /t 15

echo.
echo Opening browser...
start http://localhost:3000

pause
