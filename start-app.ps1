# Ar-Rahnu Application Startup Script
Write-Host "Starting Ar-Rahnu Application..." -ForegroundColor Green

# Set environment variables
$env:DATABASE_URL = "postgresql://postgres:badsha@123@localhost:5432/ar_rahnu"
$env:PORT = "5000"

# Start the application
Write-Host "Database: ar_rahnu" -ForegroundColor Cyan
Write-Host "Server will start on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

npx tsx server/index.ts

