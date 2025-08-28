@echo off
chcp 65001 >nul
title Quick Deploy - 一键部署
color 0E

echo ==========================================
echo        快速一键部署 - Sleep Health
echo ==========================================
echo 服务器: 47.97.0.35
echo 目标: /var/www/habit/
echo ==========================================
echo.

echo 🚀 开始部署...
echo.

echo [1/3] 提交并推送代码...
git add . >nul 2>nul
git commit -m "快速部署更新 %date% %time%" >nul 2>nul || echo "没有新的代码变更"
git push origin main >nul 2>nul && echo "✅ 代码已推送" || echo "⚠️ 推送失败或无变更"

echo [2/3] 构建前端...
npm run build >nul 2>nul && echo "✅ 前端构建完成" || echo "❌ 前端构建失败"

echo [3/3] 服务器更新...
echo 正在连接服务器并执行更新...

ssh root@47.97.0.35 "cd /var/www/habit && git pull origin main && cd backend && pip3 install -r requirements.txt --quiet && python3 init_database.py && pkill -f 'python3 run.py' || true && nohup python3 run.py > ../logs/backend.log 2>&1 & && sleep 3 && echo '服务器更新完成'"

if %errorlevel% equ 0 (
    echo ✅ 服务器更新成功
) else (
    echo ❌ 服务器更新失败，可能需要手动处理
)

echo.
echo ==========================================
echo 🎉 部署完成!
echo ==========================================
echo 前端: http://47.97.0.35
echo 后端: http://47.97.0.35:5000
echo 健康检查: http://47.97.0.35:5000/api/health
echo ==========================================
echo.

echo 测试连接...
timeout /t 3 >nul
curl -f -s "http://47.97.0.35:5000/api/health" >nul 2>nul && echo "✅ API服务正常" || echo "⚠️ API服务检查失败"

echo.
echo 按任意键退出...
pause >nul