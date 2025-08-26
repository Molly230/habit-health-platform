# 域名和SSL配置指南

## 📋 域名配置步骤

### 1. 购买域名
推荐平台：
- **阿里云** - 便宜，.com 首年50元左右
- **腾讯云** - 新用户优惠，.cn 域名便宜  
- **Namecheap** - 国外平台，支持支付宝

建议域名格式：
- `sleephealth.cn` - 睡眠健康
- `menganbang.com` - 梦安帮
- `shuimiancare.com` - 睡眠关怀

### 2. DNS配置

#### Vercel前端配置
```bash
# 在域名控制台添加CNAME记录
# 类型: CNAME
# 主机记录: @ (或 www)  
# 记录值: cname.vercel-dns.com
```

#### Railway后端配置  
```bash
# 添加A记录或CNAME记录
# 类型: CNAME
# 主机记录: api
# 记录值: your-app.up.railway.app
```

### 3. SSL证书配置

#### 方案A: 平台自动SSL (推荐)
- ✅ Vercel: 自动配置Let's Encrypt证书
- ✅ Railway: 自动HTTPS，无需配置
- ✅ Render: 免费SSL证书

#### 方案B: 手动配置SSL
如果需要自定义证书：
```bash
# 申请免费SSL证书
# 1. Let's Encrypt (推荐)
# 2. 阿里云SSL证书 (免费版)
# 3. 腾讯云SSL证书 (免费版)
```

### 4. 配置域名解析验证

创建验证脚本：
```python
# domain_verify.py
import requests
import ssl
import socket
from datetime import datetime

def verify_ssl_certificate(domain):
    """验证SSL证书"""
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                expiry = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                print(f"✅ {domain} SSL证书有效，到期时间: {expiry}")
                return True
    except Exception as e:
        print(f"❌ {domain} SSL证书验证失败: {e}")
        return False

def verify_domain_access(domain, path="/"):
    """验证域名访问"""
    try:
        response = requests.get(f"https://{domain}{path}", timeout=10)
        if response.status_code == 200:
            print(f"✅ {domain} 访问正常")
            return True
        else:
            print(f"⚠️ {domain} 返回状态码: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ {domain} 访问失败: {e}")
        return False

if __name__ == "__main__":
    domains = [
        "your-frontend-domain.com",
        "api.your-domain.com"
    ]
    
    for domain in domains:
        verify_ssl_certificate(domain)
        verify_domain_access(domain)
```

## 🔄 更新应用配置

### 更新前端API地址
```bash
# 修改 vercel.json
{
  "env": {
    "VITE_API_BASE_URL": "https://api.your-domain.com/api"
  }
}
```

### 更新后端CORS配置
```python
# 在 security_middleware.py 中更新
CORS(app, 
     origins=[
         "https://your-domain.com",
         "https://www.your-domain.com"
     ])
```

## 📝 部署后检查清单

### ✅ 前端检查
- [ ] 域名解析正常
- [ ] SSL证书有效
- [ ] 页面加载正常
- [ ] API调用正常

### ✅ 后端检查  
- [ ] API域名解析
- [ ] 健康检查通过
- [ ] 数据库连接正常
- [ ] 日志记录正常

### ✅ 安全检查
- [ ] HTTPS强制跳转
- [ ] API限流生效
- [ ] 错误不暴露敏感信息
- [ ] 数据库备份正常