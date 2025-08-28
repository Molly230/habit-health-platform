@echo off
chcp 65001 >nul
title 一键部署到阿里云服务器
color 0B

set SERVER_IP=47.97.0.35
set SERVER_USER=root
set PROJECT_PATH=/var/www/habit
set LOCAL_PROJECT=%cd%

echo ==============================================
echo    🚀 一键部署到阿里云服务器
echo    IP: %SERVER_IP%
echo    路径: %PROJECT_PATH%
echo ==============================================
echo.

echo [1/6] 检查环境...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git 未安装
    pause
    exit
)

where ssh >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ SSH 未安装，请安装 OpenSSH 或 Git Bash
    pause
    exit
)

echo ✅ 环境检查通过

echo.
echo [2/6] 提交本地代码...
git add .
git status

set /p commit_msg="输入提交信息 (直接回车使用默认): "
if "%commit_msg%"=="" set commit_msg=Deploy update %date% %time%

git commit -m "%commit_msg%"

echo.
echo [3/6] 推送到远程仓库...
git push origin main

if %errorlevel% neq 0 (
    echo ⚠️ 推送失败，继续使用SCP上传...
    goto :upload_scp
)

echo ✅ 代码推送成功

echo.
echo [4/6] 连接服务器并更新...
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH% && git pull origin main && ./update.sh"

goto :end

:upload_scp
echo.
echo [4/6] 使用SCP上传代码...
echo 正在压缩项目文件...
tar -czf project.tar.gz --exclude=node_modules --exclude=.git --exclude=backend/instance --exclude=backend/__pycache__ --exclude=project.zip .

echo 上传到服务器...
scp project.tar.gz %SERVER_USER%@%SERVER_IP%:%PROJECT_PATH%/

echo 在服务器上解压并更新...
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH% && tar -xzf project.tar.gz && rm project.tar.gz && ./update.sh"

del project.tar.gz

:end
echo.
echo [5/6] 重启服务...
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH% && ./restart.sh"

echo.
echo [6/6] 部署完成！
echo ==============================================
echo ✅ 部署成功完成！
echo ==============================================
echo.
echo 🌐 访问地址: http://%SERVER_IP%/
echo 📊 API健康检查: http://%SERVER_IP%/api/health
echo.
echo 💡 如果有问题，请检查服务器日志:
echo    ssh %SERVER_USER%@%SERVER_IP%
echo    cd %PROJECT_PATH%
echo    tail -f logs/app.log
echo.
pause