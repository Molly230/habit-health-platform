"""
生产环境安全中间件配置
"""
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
import logging
import os

def configure_security(app: Flask):
    """配置生产环境安全措施"""
    
    # 1. CORS安全配置
    CORS(app, 
         origins=[
             "https://your-domain.vercel.app",
             "https://insomnia-ai-doctor-frontend.onrender.com"
         ],
         supports_credentials=True)
    
    # 2. 请求频率限制
    limiter = Limiter(
        app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"  # 生产环境建议用Redis
    )
    
    # 3. API特定限制
    @limiter.limit("10 per minute")
    def diagnosis_rate_limit():
        pass
    
    # 4. 安全头设置
    @app.after_request
    def security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response
    
    # 5. 日志配置
    if not app.debug:
        logging.basicConfig(
            level=logging.WARNING,
            format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]',
            handlers=[
                logging.FileHandler('logs/app.log'),
                logging.StreamHandler()
            ]
        )
    
    return limiter

def configure_database_security(app: Flask):
    """配置数据库安全"""
    
    # 数据库连接池配置
    app.config.update(
        SQLALCHEMY_POOL_SIZE=10,
        SQLALCHEMY_POOL_TIMEOUT=30,
        SQLALCHEMY_POOL_RECYCLE=3600,
        SQLALCHEMY_MAX_OVERFLOW=20
    )
    
    # 敏感数据加密存储
    app.config['ENCRYPT_USER_DATA'] = True
    
    return app