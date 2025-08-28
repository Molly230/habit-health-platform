@echo off
chcp 65001 >nul
title 🐳 Docker一键部署到阿里云
color 0B

set SERVER_IP=47.97.0.35
set SERVER_USER=root
set PROJECT_PATH=/var/www/habit

echo ==============================================
echo    🐳 Docker一键部署到阿里云服务器
echo    IP: %SERVER_IP%
echo    路径: %PROJECT_PATH%
echo ==============================================
echo.

echo [1/5] 检查本地环境...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git 未安装
    pause
    exit
)

where ssh >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ SSH 未安装，请使用Git Bash或安装OpenSSH
    pause
    exit
)

echo ✅ 环境检查通过

echo.
echo [2/5] 提交并推送代码...
git add .

set /p commit_msg="输入提交信息 (直接回车使用默认): "
if "%commit_msg%"=="" set commit_msg=Docker deploy %date% %time%

git commit -m "%commit_msg%"
git push origin main
echo ✅ 代码提交完成

echo.
echo [3/5] 上传项目到服务器...
echo 正在创建部署包...

tar -czf deploy.tar.gz --exclude=node_modules --exclude=.git --exclude=backend/__pycache__ --exclude=backend/instance --exclude=logs --exclude="*.log" --exclude=deploy.tar.gz .

echo 上传到服务器...
scp deploy.tar.gz %SERVER_USER%@%SERVER_IP%:%PROJECT_PATH%/
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH% && tar -xzf deploy.tar.gz && rm deploy.tar.gz"
del deploy.tar.gz
echo ✅ 项目上传完成

echo.
echo [4/5] Docker部署...
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH% && docker-compose down"
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH% && docker-compose build --no-cache" 
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH% && docker-compose up -d"
echo ✅ Docker容器启动完成

echo.
echo [5/5] 验证部署结果...
timeout /t 15 /nobreak >nul
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH% && docker-compose ps"

curl -f -s "http://%SERVER_IP%:10000/api/health" >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ API服务正常
) else (
    echo ⚠️ API连接测试失败
)

echo.
echo ==============================================
echo ✅ Docker部署完成！
echo ==============================================
echo 🌐 访问: http://%SERVER_IP%/
echo 📊 API: http://%SERVER_IP%:10000/api/health
echo 📝 日志: ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH% && docker-compose logs -f"
echo.
pause