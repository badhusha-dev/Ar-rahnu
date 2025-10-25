@echo off
cls
echo ========================================
echo   Ar-Rahnu + BSE Modular System
echo ========================================
echo.
echo Setting up environment...
echo.

REM Set environment variables
set DATABASE_URL=postgresql://postgres:badsha@123@localhost:5432/ar_rahnu
set RAHNU_API_PORT=4001
set BSE_API_PORT=4002
set CLIENT_URL=http://localhost:5173
set NODE_ENV=development

echo Environment Configuration:
echo   Database: ar_rahnu
echo   Rahnu API: http://localhost:4001
echo   BSE API: http://localhost:4002
echo   Frontend: http://localhost:5173
echo.
echo ========================================
echo   Starting all services...
echo ========================================
echo.
echo Press Ctrl+C to stop all services
echo.

REM Run all services concurrently
npm run dev

pause

