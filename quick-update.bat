@echo off
chcp 65001 >nul
title Quick Update Deploy
color 0A

set SERVER_IP=47.97.0.35
set SERVER_USER=root
set PROJECT_PATH=/var/www/habit

echo ==============================================
echo    Quick Update Deploy to Server
echo    IP: %SERVER_IP%
echo ==============================================
echo.

echo [1/3] Commit local code...
git add .

set /p commit_msg="Update description (Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update %date% %time%

git commit -m "%commit_msg%"
git push origin main
echo Code push completed

echo.
echo [2/3] Update server code...
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH% && git pull origin main"
echo Code update completed

echo.
echo [3/3] Restart services...
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH% && npm run build"
ssh %SERVER_USER%@%SERVER_IP% "pkill -f 'python3 run.py' || true"
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH%/backend && nohup python3 run.py > ../logs/backend.log 2>&1 &"

echo Service restart completed

echo.
echo ==============================================
echo Update deploy completed!
echo ==============================================
echo Website: http://%SERVER_IP%/
echo API: http://%SERVER_IP%:10000/api/health
echo.
pause