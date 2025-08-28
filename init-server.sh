#!/bin/bash

# 服务器初始化脚本
# 在服务器上第一次运行，设置基础环境

echo "=========================================="
echo "🚀 服务器环境初始化"
echo "=========================================="

# 更新系统
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 安装基础软件
echo "📦 安装必要软件..."
apt install -y git curl wget unzip nginx python3 python3-pip nodejs npm

# 安装PM2（可选，用于进程管理）
echo "📦 安装 PM2..."
npm install -g pm2

# 创建项目目录
echo "📁 创建项目目录..."
mkdir -p /var/www/habit
mkdir -p /var/www/backups
mkdir -p /var/www/habit/logs

# 设置目录权限
chown -R www-data:www-data /var/www/habit
chmod -R 755 /var/www/habit

# 配置防火墙
echo "🔥 配置防火墙..."
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 10000 # 后端API
ufw --force enable

# 配置 Nginx
echo "🌐 配置 Nginx..."
cat > /etc/nginx/sites-available/habit << 'EOF'
server {
    listen 80;
    server_name _;
    
    # 前端静态文件
    location / {
        root /var/www/habit/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理到后端
    location /api/ {
        proxy_pass http://localhost:10000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/habit /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx
systemctl enable nginx

# 安装Python依赖管理
echo "🐍 安装 Python 依赖管理工具..."
pip3 install virtualenv gunicorn

# 克隆项目（如果有Git仓库）
echo "📥 准备项目目录..."
cd /var/www/habit

# 创建启动脚本
cat > /var/www/habit/start.sh << 'EOF'
#!/bin/bash
cd /var/www/habit
mkdir -p logs
cd backend
nohup python3 run.py > ../logs/backend.log 2>&1 &
echo "服务已启动，PID: $!"
EOF

chmod +x /var/www/habit/start.sh

# 创建systemd服务（可选）
cat > /etc/systemd/system/habit.service << 'EOF'
[Unit]
Description=Habit Health Platform
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/habit/backend
ExecStart=/usr/bin/python3 run.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd
systemctl daemon-reload

echo "=========================================="
echo "✅ 服务器初始化完成！"
echo "=========================================="
echo "📁 项目目录: /var/www/habit"
echo "🌐 Nginx配置: /etc/nginx/sites-available/habit"
echo "📝 查看日志: tail -f /var/www/habit/logs/backend.log"
echo "🔄 重启Nginx: systemctl restart nginx"
echo "🚀 启动服务: systemctl start habit"
echo ""
echo "下一步: 在本地运行 deploy.bat 进行部署"
echo "=========================================="