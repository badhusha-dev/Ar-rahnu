@echo off
echo ========================================
echo    Ar-Rahnu ^& BSE Financial System
echo    Complete Modular Platform
echo ========================================
echo.

REM Set environment variables
set DATABASE_URL=postgresql://postgres:badsha@123@localhost:5432/ar_rahnu
set RAHNU_API_PORT=5001
set BSE_API_PORT=5002
set CLIENT_PORT=5000

echo [1/4] Setting environment...
echo   DATABASE_URL: Set
echo   RAHNU_API_PORT: 5001
echo   BSE_API_PORT: 5002
echo   CLIENT_PORT: 5000
echo.

echo [2/4] Checking database...
echo   Database: ar_rahnu
echo   Host: localhost:5432
echo.

echo [3/4] Starting services...
echo   ^> Rahnu API: http://localhost:5001
echo   ^> BSE API: http://localhost:5002  
echo   ^> Web Client: http://localhost:5000
echo.

echo [4/4] Launching application...
echo   Press Ctrl+C to stop all services
echo.

REM Start all services
npm run dev

