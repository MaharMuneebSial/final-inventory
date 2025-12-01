@echo off
title ELECTRON APP - COMPLETE RESTART
color 0B

echo.
echo ================================================
echo  COMPLETE RESTART - ELECTRON + NEXT.JS
echo ================================================
echo.

echo [1/6] Closing Electron app...
taskkill /F /IM "Inventory Software.exe" 2>nul
taskkill /F /IM electron.exe 2>nul
echo       Done
echo.

echo [2/6] Killing all Node.js processes...
taskkill /F /IM node.exe /T
echo       Done
echo.

echo [3/6] Waiting for cleanup (5 seconds)...
timeout /t 5 /nobreak >nul
echo       Done
echo.

echo [4/6] Removing cache files...
if exist "out" rmdir /s /q "out"
if exist ".next" rmdir /s /q ".next"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
echo       All cache removed
echo.

echo [5/6] Starting Next.js dev server...
start /B npm run dev
echo       Server starting in background...
echo.

echo [6/6] Waiting for server to be ready (15 seconds)...
timeout /t 15 /nobreak
echo       Server should be ready now
echo.

echo ================================================
echo  STARTING ELECTRON APP
echo ================================================
echo.

npm run electron

pause
