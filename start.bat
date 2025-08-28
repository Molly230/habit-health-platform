@echo off
chcp 65001 >nul
title Sleep Health Platform - Local Deploy
color 0A

echo ==============================================
echo    Sleep Health Management Platform
echo    Local Deployment Script
echo ==============================================
echo.

echo [1/4] Checking environment...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo X Python not installed or not in PATH
    echo Please install Python 3.8+
    pause
    exit
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X Node.js not installed or not in PATH
    echo Please install Node.js 16+
    pause
    exit
)

echo OK Python and Node.js environment check passed

echo.
echo [2/4] Initialize backend...
cd backend

echo Installing Python dependencies...
pip install -r requirements.txt -q

echo Initialize database...
python init_database.py

echo.
echo [3/4] Initialize frontend...
cd ..

echo Installing frontend dependencies...
npm install --silent

echo.
echo [4/4] Starting services...
echo.
echo Starting backend service (port: 5000)...
start "Backend Service" cmd /k "cd backend && python run.py"

timeout /t 3 /nobreak > nul

echo Starting frontend service (port: 5173)...
start "Frontend Service" cmd /k "npm run dev"

echo.
echo ==============================================
echo Deployment completed!
echo ==============================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo API Health: http://localhost:5000/api/health
echo.
echo Experience Path:
echo   1. Visit homepage - Start health assessment
echo   2. Complete 19-question survey - View diagnosis results
echo   3. Product recommendations - Shopping cart - Checkout
echo.
echo Note: Closing this window will not close services
echo       Please close the corresponding service windows
echo.
pause