@echo off
title Sleep Health Platform Deploy
color 0B

set SERVER_IP=47.97.0.35
set SERVER_USER=root
set PROJECT_PATH=/var/www/habit

echo ==================================
echo Sleep Health Platform Deploy
echo ==================================
echo Server: %SERVER_IP%
echo Path: %PROJECT_PATH%
echo ==================================
echo.

echo [1/5] Check environment...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Git not found
    pause
    exit
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm not found
    pause
    exit
)

echo OK: Environment check passed
echo.

echo [2/5] Commit local changes...
git add .
git status --porcelain > temp.txt
set /p changes=<temp.txt 2>nul
del temp.txt 2>nul

if defined changes (
    echo Committing changes...
    git commit -m "Deploy update %date% %time%"
) else (
    echo No changes to commit
)

echo Pushing to remote...
git push origin main
echo OK: Code pushed
echo.

echo [3/5] Build frontend...
npm install
npm run build
echo OK: Frontend built
echo.

echo [4/5] Deploy to server...
echo Checking SSH connection...
ssh -o ConnectTimeout=5 %SERVER_USER%@%SERVER_IP% "echo 'Connected'" 2>nul
if %errorlevel% equ 0 (
    echo OK: Server connected
    echo Uploading update script...
    scp update_server.sh %SERVER_USER%@%SERVER_IP%:%PROJECT_PATH%/
    
    echo Running server update...
    ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH% && chmod +x update_server.sh && ./update_server.sh"
    
    echo OK: Server updated
) else (
    echo Error: Cannot connect to server
    echo Please check SSH key or password
)
echo.

echo [5/5] Verify deployment...
timeout /t 5 /nobreak >nul

curl -f -s "http://%SERVER_IP%:5000/api/health" >nul 2>nul
if %errorlevel% equ 0 (
    echo OK: API service running
) else (
    echo Warning: API check failed
)

echo.
echo ==================================
echo Deploy completed!
echo ==================================
echo Frontend: http://%SERVER_IP%
echo Backend: http://%SERVER_IP%:5000
echo Health: http://%SERVER_IP%:5000/api/health
echo ==================================
echo.
pause