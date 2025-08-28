#!/bin/bash

# 一键部署到阿里云服务器脚本
# 服务器: 47.97.0.35
# 项目路径: /var/www/habit/

set -e  # 遇到错误立即退出

# 配置
SERVER_IP="47.97.0.35"
SERVER_USER="root"  # 根据实际情况修改用户名
PROJECT_PATH="/var/www/habit"
LOCAL_PATH=$(pwd)

echo "=================================="
echo "Sleep Health Platform - Deploy"
echo "=================================="
echo "Server: $SERVER_IP"
echo "Path: $PROJECT_PATH"
echo "=================================="

# 1. 提交本地代码
echo "[1/6] 提交本地代码变更..."
git add .
git status --porcelain
if [ $? -eq 0 ] && [ -n "$(git status --porcelain)" ]; then
    echo "发现未提交的变更，正在提交..."
    git commit -m "部署前代码更新 $(date '+%Y-%m-%d %H:%M:%S')"
else
    echo "没有需要提交的变更"
fi

# 2. 推送到远程仓库
echo "[2/6] 推送代码到远程仓库..."
git push origin main

# 3. 打包前端
echo "[3/6] 构建前端..."
npm install
npm run build

# 4. 同步代码到服务器
echo "[4/6] 同步代码到服务器..."
rsync -avz --delete \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=backend/__pycache__ \
    --exclude=backend/app/__pycache__ \
    --exclude=backend/app/api/__pycache__ \
    --exclude=backend/app/diagnosis/__pycache__ \
    --exclude=backend/app/models/__pycache__ \
    --exclude=backend/insomnia_diagnosis.db \
    --exclude=backend/instance \
    ./ $SERVER_USER@$SERVER_IP:$PROJECT_PATH/

# 5. 在服务器上更新依赖和重启服务
echo "[5/6] 在服务器上更新依赖和重启服务..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /var/www/habit

echo "安装后端依赖..."
cd backend
pip3 install -r requirements.txt

echo "初始化数据库..."
python3 init_database.py

echo "重启后端服务..."
pkill -f "python3 run.py" || true
nohup python3 run.py > ../logs/backend.log 2>&1 &
echo "后端服务已重启"

echo "检查服务状态..."
sleep 3
if pgrep -f "python3 run.py" > /dev/null; then
    echo "✅ 后端服务运行正常"
else
    echo "❌ 后端服务启动失败，请检查日志"
    exit 1
fi

echo "重启Nginx..."
nginx -t && systemctl reload nginx
echo "✅ Nginx已重启"

ENDSSH

# 6. 验证部署
echo "[6/6] 验证部署..."
echo "等待服务启动..."
sleep 5

# 检查API健康状态
if curl -f -s "http://$SERVER_IP:5000/api/health" > /dev/null; then
    echo "✅ API服务正常"
else
    echo "❌ API服务异常，请检查"
fi

echo "=================================="
echo "🎉 部署完成!"
echo "=================================="
echo "前端地址: http://$SERVER_IP"
echo "后端API: http://$SERVER_IP:5000"
echo "健康检查: http://$SERVER_IP:5000/api/health"
echo "=================================="
echo "如有问题，请检查服务器日志："
echo "ssh $SERVER_USER@$SERVER_IP 'tail -f /var/www/habit/logs/backend.log'"
echo "=================================="