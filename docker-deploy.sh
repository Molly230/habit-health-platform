#!/bin/bash

echo "🚀 开始部署..."

# 停止并移除旧容器
echo "停止旧容器..."
docker-compose down

# 清理未使用的镜像
echo "清理旧镜像..."
docker system prune -f

# 构建并启动新容器
echo "构建新镜像..."
docker-compose build --no-cache

echo "启动服务..."
docker-compose up -d

# 检查服务状态
echo "检查服务状态..."
sleep 10
docker-compose ps

echo "✅ 部署完成！"
echo "🌐 前端访问: http://your-server-ip"
echo "🔧 后端API: http://your-server-ip/api"

# 显示日志
echo "📋 最近日志:"
docker-compose logs --tail=20