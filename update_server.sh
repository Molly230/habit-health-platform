#!/bin/bash

# 服务器端更新脚本
# 在阿里云服务器 /var/www/habit/ 目录执行

set -e

PROJECT_PATH="/var/www/habit"
LOG_DIR="$PROJECT_PATH/logs"
BACKUP_DIR="$PROJECT_PATH/backups"

echo "=================================="
echo "服务器端更新开始..."
echo "时间: $(date)"
echo "=================================="

# 创建必要目录
mkdir -p "$LOG_DIR"
mkdir -p "$BACKUP_DIR"

cd $PROJECT_PATH

# 1. 备份当前版本
echo "[1/7] 备份当前版本..."
BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=__pycache__ \
    --exclude=logs \
    --exclude=backups \
    . || echo "备份失败，继续部署..."

echo "备份完成: $BACKUP_NAME.tar.gz"

# 2. 拉取最新代码
echo "[2/7] 拉取最新代码..."
if [ -d ".git" ]; then
    git stash push -m "自动备份本地修改 $(date)" || true
    git pull origin main
    echo "✅ 代码更新完成"
else
    echo "⚠️  不是Git仓库，跳过代码拉取"
fi

# 3. 更新后端依赖
echo "[3/7] 更新后端依赖..."
cd backend

echo "检查Python环境..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
else
    echo "❌ Python未找到"
    exit 1
fi

echo "使用Python命令: $PYTHON_CMD"

echo "安装/更新依赖..."
pip3 install -r requirements.txt --upgrade

# 4. 数据库迁移
echo "[4/7] 数据库处理..."
if [ -f "insomnia_diagnosis.db" ]; then
    echo "发现现有数据库，创建备份..."
    cp insomnia_diagnosis.db "$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).db"
fi

echo "初始化/更新数据库..."
$PYTHON_CMD init_database.py

# 5. 停止旧服务
echo "[5/7] 停止旧服务..."
echo "停止Python后端服务..."
pkill -f "$PYTHON_CMD run.py" || echo "没有运行的Python服务"
pkill -f "gunicorn" || echo "没有运行的Gunicorn服务"

# 等待进程完全停止
sleep 2

# 6. 启动新服务
echo "[6/7] 启动新服务..."

# 检查是否有gunicorn配置
if [ -f "gunicorn.conf.py" ]; then
    echo "使用Gunicorn启动服务..."
    nohup gunicorn -c gunicorn.conf.py run:app > "$LOG_DIR/backend.log" 2>&1 &
    SERVICE_TYPE="Gunicorn"
else
    echo "使用Python直接启动服务..."
    nohup $PYTHON_CMD run.py > "$LOG_DIR/backend.log" 2>&1 &
    SERVICE_TYPE="Python"
fi

echo "$SERVICE_TYPE 服务已启动"

# 7. 验证服务
echo "[7/7] 验证服务启动..."
sleep 5

# 检查进程
if [ "$SERVICE_TYPE" = "Gunicorn" ]; then
    if pgrep -f "gunicorn" > /dev/null; then
        echo "✅ Gunicorn服务运行正常"
        SERVICE_OK=true
    else
        echo "❌ Gunicorn服务启动失败"
        SERVICE_OK=false
    fi
else
    if pgrep -f "$PYTHON_CMD run.py" > /dev/null; then
        echo "✅ Python服务运行正常"  
        SERVICE_OK=true
    else
        echo "❌ Python服务启动失败"
        SERVICE_OK=false
    fi
fi

# 检查端口
if ss -tlnp | grep -q ":5000 "; then
    echo "✅ 端口5000已监听"
else
    echo "❌ 端口5000未监听"
    SERVICE_OK=false
fi

# API健康检查
sleep 3
if curl -f -s "http://localhost:5000/api/health" > /dev/null; then
    echo "✅ API健康检查通过"
else
    echo "⚠️  API健康检查失败"
    SERVICE_OK=false
fi

# 8. Nginx重载（如果存在）
if command -v nginx &> /dev/null; then
    echo "重载Nginx配置..."
    if nginx -t 2>/dev/null; then
        systemctl reload nginx || service nginx reload
        echo "✅ Nginx配置重载完成"
    else
        echo "⚠️  Nginx配置测试失败"
    fi
fi

echo "=================================="
if [ "$SERVICE_OK" = true ]; then
    echo "🎉 更新部署成功!"
else
    echo "⚠️  部署完成但服务可能异常"
fi
echo "=================================="
echo "服务状态检查:"
echo "进程: $(pgrep -f 'run.py\|gunicorn' | wc -l) 个"
echo "端口: $(ss -tlnp | grep ':5000 ' | wc -l) 个监听"
echo "日志位置: $LOG_DIR/backend.log"
echo "备份位置: $BACKUP_DIR/"
echo "=================================="
echo "常用命令:"
echo "查看日志: tail -f $LOG_DIR/backend.log"
echo "重启服务: pkill -f 'run.py\|gunicorn' && cd $PROJECT_PATH/backend && nohup $PYTHON_CMD run.py > $LOG_DIR/backend.log 2>&1 &"
echo "查看进程: ps aux | grep 'run.py\|gunicorn'"
echo "=================================="