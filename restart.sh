#!/bin/bash

# 服务重启脚本
# 在 /var/www/habit/ 目录下运行

PROJECT_DIR="/var/www/habit"

echo "=========================================="
echo "🔄 重启服务"
echo "=========================================="

cd $PROJECT_DIR

# 创建日志目录
mkdir -p logs

echo "🛑 停止现有服务..."
# 杀掉旧进程
pkill -f "python.*run.py" || true
pkill -f "node.*vite" || true
pkill -f "gunicorn" || true

echo "⏳ 等待进程完全停止..."
sleep 5

echo "🚀 启动后端服务..."
cd backend

# 检查端口是否被占用
if netstat -tuln | grep :10000; then
    echo "⚠️ 端口 10000 仍被占用，尝试强制杀掉进程..."
    fuser -k 10000/tcp || true
    sleep 2
fi

# 启动后端
nohup python3 run.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "后端进程 PID: $BACKEND_PID"

# 等待后端启动
echo "⏳ 等待后端启动..."
sleep 8

# 检查后端是否启动成功
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ 后端服务启动成功"
    
    # 测试API
    echo "🔍 测试 API 连接..."
    sleep 2
    if curl -f -s "http://localhost:10000/api/health" >/dev/null; then
        echo "✅ API 响应正常"
    else
        echo "⚠️ API 无响应，检查日志"
    fi
else
    echo "❌ 后端服务启动失败"
    echo "最近日志:"
    tail -20 ../logs/backend.log
    exit 1
fi

echo "=========================================="
echo "✅ 服务重启完成！"
echo "=========================================="
echo "🌐 前端: http://服务器IP/"
echo "🔧 后端: http://服务器IP:10000"
echo "📊 健康检查: http://服务器IP:10000/api/health"
echo "📝 查看日志: tail -f $PROJECT_DIR/logs/backend.log"
echo "=========================================="