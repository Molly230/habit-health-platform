#!/bin/bash

# 阿里云轻量服务器一键部署脚本
# 适用于: 阿里云轻量应用服务器
# 系统要求: Ubuntu 20.04+ / CentOS 7+

set -e  # 遇到错误立即退出

# ========================================
# 配置区域 - 请根据你的服务器信息修改
# ========================================
SERVER_IP="${SERVER_IP:-请填写你的服务器IP}"
SERVER_USER="${SERVER_USER:-root}"
PROJECT_PATH="${PROJECT_PATH:-/var/www/habit}"
DOMAIN="${DOMAIN:-}"  # 可选：如果有域名就填写

# ========================================
# 颜色输出配置
# ========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 输出函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[成功]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[警告]${NC} $1"; }
log_error() { echo -e "${RED}[错误]${NC} $1"; }

# ========================================
# 检查配置
# ========================================
check_config() {
    log_info "检查配置..."
    
    if [ "$SERVER_IP" = "请填写你的服务器IP" ]; then
        log_error "请先配置SERVER_IP环境变量或修改脚本中的IP地址"
        echo "使用方法: SERVER_IP=你的IP ./deploy-aliyun-light.sh"
        exit 1
    fi
    
    log_success "配置检查完成"
    echo "服务器IP: $SERVER_IP"
    echo "用户名: $SERVER_USER" 
    echo "项目路径: $PROJECT_PATH"
    echo "域名: ${DOMAIN:-未配置}"
}

# ========================================
# 主要部署流程
# ========================================
echo "=================================="
echo "🚀 失眠健康平台 - 阿里云轻量部署"
echo "=================================="

check_config

# 1. 本地代码准备
log_info "[1/7] 准备本地代码..."
if [ -n "$(git status --porcelain)" ]; then
    log_warning "发现未提交的变更，正在提交..."
    git add .
    git commit -m "部署前更新 $(date '+%Y-%m-%d %H:%M:%S')" || true
    git push origin main || log_warning "推送失败，请检查git配置"
fi

# 2. 构建前端
log_info "[2/7] 构建前端资源..."
npm install --production=false
npm run build
log_success "前端构建完成"

# 3. 检查服务器连接
log_info "[3/7] 检查服务器连接..."
if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo '连接成功'" >/dev/null 2>&1; then
    log_error "无法连接到服务器，请检查:"
    echo "1. IP地址是否正确: $SERVER_IP"
    echo "2. SSH密钥是否配置"
    echo "3. 服务器是否已启动"
    exit 1
fi
log_success "服务器连接正常"

# 4. 服务器环境检查
log_info "[4/7] 检查服务器环境..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    # 检查并安装必要软件
    if ! command -v docker >/dev/null 2>&1; then
        echo "安装Docker..."
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1; then
        echo "安装Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    echo "✅ 服务器环境检查完成"
ENDSSH

# 5. 同步代码到服务器
log_info "[5/7] 同步代码到服务器..."
rsync -avz --delete \
    --exclude=node_modules \
    --exclude=.git \
    --exclude='backend/__pycache__' \
    --exclude='backend/**/__pycache__' \
    --exclude='*.pyc' \
    --exclude='.env*' \
    --exclude='logs/' \
    ./ $SERVER_USER@$SERVER_IP:$PROJECT_PATH/

log_success "代码同步完成"

# 6. 服务器部署
log_info "[6/7] 服务器部署和启动..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
cd $PROJECT_PATH

# 停止旧服务
echo "停止现有服务..."
docker-compose down || true

# 创建必要目录
mkdir -p logs
mkdir -p backend/instance

# 构建和启动服务
echo "启动新服务..."
docker-compose up -d --build

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
if docker-compose ps | grep -q "Up"; then
    echo "✅ 服务启动成功"
else
    echo "❌ 服务启动失败，查看日志:"
    docker-compose logs
    exit 1
fi

ENDSSH

# 7. 健康检查
log_info "[7/7] 服务健康检查..."
sleep 5

# 检查前端
if curl -f -s "http://$SERVER_IP" >/dev/null; then
    log_success "前端服务正常"
else
    log_warning "前端服务可能异常"
fi

# 检查后端API
if curl -f -s "http://$SERVER_IP:10000/api/health" >/dev/null; then
    log_success "后端API正常"
else
    log_warning "后端API可能异常"
fi

# ========================================
# 部署完成
# ========================================
echo ""
echo "=================================="
echo "🎉 部署完成!"
echo "=================================="
echo "访问地址:"
echo "  前端: http://$SERVER_IP"
if [ -n "$DOMAIN" ]; then
    echo "  域名: http://$DOMAIN"
fi
echo "  后端API: http://$SERVER_IP:10000"
echo "  健康检查: http://$SERVER_IP:10000/api/health"
echo ""
echo "管理命令:"
echo "  查看服务状态: ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH && docker-compose ps'"
echo "  查看日志: ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH && docker-compose logs -f'"
echo "  重启服务: ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH && docker-compose restart'"
echo "=================================="

# 如果有域名，提示SSL配置
if [ -n "$DOMAIN" ]; then
    echo ""
    log_info "💡 下一步建议配置SSL证书:"
    echo "1. 阿里云SSL证书（免费）"
    echo "2. 或使用 Let's Encrypt: certbot --nginx -d $DOMAIN"
fi