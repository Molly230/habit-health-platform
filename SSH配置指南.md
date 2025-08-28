# 🔑 SSH密钥配置指南

## 快速配置步骤

### 1. 生成SSH密钥（如果还没有）

```bash
# 在本地 Git Bash 或 PowerShell 中运行
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 按回车使用默认路径：~/.ssh/id_rsa
# 可以设置密码，也可以留空
```

### 2. 复制公钥到服务器

```bash
# 方法1: 使用 ssh-copy-id（推荐）
ssh-copy-id root@47.97.0.35

# 方法2: 手动复制
# 先显示公钥内容
cat ~/.ssh/id_rsa.pub

# 然后登录服务器，将内容添加到 ~/.ssh/authorized_keys
ssh root@47.97.0.35
mkdir -p ~/.ssh
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
exit
```

### 3. 测试SSH连接

```bash
# 测试无密码登录
ssh root@47.97.0.35

# 如果成功，应该不需要输入密码直接登录
```

### 4. 配置SSH客户端（可选）

在本地创建 `~/.ssh/config` 文件：

```
Host habit-server
    HostName 47.97.0.35
    User root
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

这样可以直接使用 `ssh habit-server` 连接。

## 🚀 快速一键配置脚本

如果上面步骤太麻烦，运行这个脚本：

```bash
# 在 Git Bash 中运行
curl -L https://github.com/settings/keys | head -1  # 检查网络
ssh-keygen -t rsa -b 4096 -f ~/.ssh/habit_key -N ""
ssh-copy-id -i ~/.ssh/habit_key.pub root@47.97.0.35
ssh -i ~/.ssh/habit_key root@47.97.0.35 "echo 'SSH配置成功!'"
```

## ⚠️ 常见问题

### 问题1: Permission denied (publickey)
```bash
# 检查权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub

# 检查服务器端权限
ssh root@47.97.0.35
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 问题2: 连接超时
```bash
# 检查防火墙
ssh -v root@47.97.0.35  # 详细模式查看连接过程
```

### 问题3: Windows下SSH命令不识别
- 安装 Git for Windows (包含SSH)
- 或使用 Windows OpenSSH
- 或使用 PuTTY

## 🔧 验证配置

运行这个命令测试整个部署链路：

```bash
# 测试SSH连接
ssh root@47.97.0.35 "cd /var/www/habit && pwd && ls -la"

# 如果成功，说明SSH配置完成，可以开始部署
```

配置完成后，运行 `deploy.bat` 就能一键部署了！