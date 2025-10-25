@echo off
echo ========================================
echo    Ar-Rahnu ^& BSE Modular System
echo    Starting All Services...
echo ========================================
echo.

REM Set all environment variables
set DATABASE_URL=postgresql://postgres:badsha@123@localhost:5432/ar_rahnu
set RAHNU_API_PORT=5001
set BSE_API_PORT=5002
set CLIENT_PORT=5000
set JWT_SECRET=your-secret-key-change-in-production
set JWT_REFRESH_SECRET=your-refresh-secret-key

echo [INFO] Environment configured:
echo   DATABASE_URL: Set
echo   RAHNU_API_PORT: 5001
echo   BSE_API_PORT: 5002
echo.

echo [INFO] Starting services...
echo   Press Ctrl+C to stop all services
echo.

REM Start using npm
npm run dev

