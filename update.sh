#!/bin/bash

# 服务器端更新脚本
# 在 /var/www/habit/ 目录下运行

set -e  # 出现错误立即停止

PROJECT_DIR="/var/www/habit"
BACKUP_DIR="/var/www/backups"
SERVICE_NAME="habit"

echo "=========================================="
echo "🔄 开始服务器端更新"
echo "=========================================="

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份当前版本
echo "📦 备份当前版本..."
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
cp -r $PROJECT_DIR $BACKUP_DIR/$BACKUP_NAME
echo "✅ 备份完成: $BACKUP_DIR/$BACKUP_NAME"

cd $PROJECT_DIR

echo "🔄 更新代码..."
git pull origin main || echo "⚠️ Git pull 失败，使用上传的文件"

echo "📦 安装后端依赖..."
cd backend
pip3 install -r requirements.txt

echo "🗄️ 更新数据库..."
python3 init_database.py

echo "📦 安装前端依赖..."
cd ..
npm install

echo "🏗️ 构建前端..."
npm run build

echo "🔄 重启服务..."
# 杀掉旧进程
pkill -f "python.*run.py" || true
pkill -f "node.*vite" || true

# 等待进程完全停止
sleep 3

echo "🚀 启动后端服务..."
cd backend
nohup python3 run.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "后端进程 PID: $BACKEND_PID"

# 等待后端启动
sleep 5

# 检查后端是否启动成功
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败，检查日志:"
    tail -20 ../logs/backend.log
    exit 1
fi

# 配置 nginx (如果存在)
if command -v nginx &> /dev/null; then
    echo "🔄 重载 Nginx..."
    nginx -t && nginx -s reload || echo "⚠️ Nginx 配置有问题"
fi

echo "🧹 清理备份 (保留最近10个)..."
cd $BACKUP_DIR
ls -t | tail -n +11 | xargs rm -rf || true

echo "=========================================="
echo "✅ 更新完成！"
echo "=========================================="
echo "🌐 访问地址: http://服务器IP/"
echo "📊 API检查: http://服务器IP:10000/api/health"
echo "📝 后端日志: tail -f $PROJECT_DIR/logs/backend.log"
echo "=========================================="