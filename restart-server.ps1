# PowerShell script to properly restart Next.js dev server

Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "Removing lock file..." -ForegroundColor Yellow
$lockPath = "out\dev\lock"
if (Test-Path $lockPath) {
    Remove-Item -Path $lockPath -Force
    Write-Host "Lock file removed" -ForegroundColor Green
}

Write-Host "Starting Next.js dev server..." -ForegroundColor Yellow
npm run dev
