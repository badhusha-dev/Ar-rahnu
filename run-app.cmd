@echo off
echo ========================================
echo    Ar-Rahnu Application Server
echo ========================================
echo.
echo Setting up environment...
set DATABASE_URL=postgresql://postgres:badsha@123@localhost:5432/ar_rahnu
set PORT=5000
echo Database: ar_rahnu
echo Server URL: http://localhost:5000
echo.
echo Starting server...
echo Press Ctrl+C to stop
echo.
npx tsx server/index.ts

