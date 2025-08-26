#!/usr/bin/env python3
"""
Railway启动脚本
"""
import os
import sys

# 将backend目录添加到Python路径
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# 切换到backend目录
os.chdir(backend_dir)

# 导入并启动应用
from run_app_with_db import run_app

if __name__ == "__main__":
    print("🚀 Railway启动失眠AI诊疗系统...")
    run_app()