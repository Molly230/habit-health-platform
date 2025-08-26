"""
数据库备份和监控脚本
"""
import sqlite3
import shutil
import os
import schedule
import time
from datetime import datetime
import logging
import requests

class DatabaseBackup:
    def __init__(self, db_path='instance/insomnia_diagnosis.db'):
        self.db_path = db_path
        self.backup_dir = 'backups'
        os.makedirs(self.backup_dir, exist_ok=True)
    
    def create_backup(self):
        """创建数据库备份"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'backup_{timestamp}.db'
        backup_path = os.path.join(self.backup_dir, backup_filename)
        
        try:
            shutil.copy2(self.db_path, backup_path)
            logging.info(f"数据库备份成功: {backup_path}")
            self.cleanup_old_backups()
            return backup_path
        except Exception as e:
            logging.error(f"数据库备份失败: {str(e)}")
            return None
    
    def cleanup_old_backups(self, keep_days=7):
        """清理旧备份，保留7天"""
        current_time = time.time()
        for filename in os.listdir(self.backup_dir):
            file_path = os.path.join(self.backup_dir, filename)
            if os.path.getctime(file_path) < current_time - keep_days * 86400:
                os.remove(file_path)
                logging.info(f"删除旧备份: {filename}")

class SystemMonitor:
    def __init__(self, api_url='http://localhost:5000/api/health'):
        self.api_url = api_url
    
    def check_health(self):
        """检查系统健康状态"""
        try:
            response = requests.get(self.api_url, timeout=10)
            if response.status_code == 200:
                logging.info("系统健康检查: 正常")
                return True
            else:
                logging.warning(f"系统健康检查: 异常状态码 {response.status_code}")
                return False
        except Exception as e:
            logging.error(f"系统健康检查: 连接失败 {str(e)}")
            return False
    
    def check_database_size(self, max_size_mb=100):
        """检查数据库大小"""
        db_path = 'instance/insomnia_diagnosis.db'
        if os.path.exists(db_path):
            size_mb = os.path.getsize(db_path) / (1024 * 1024)
            if size_mb > max_size_mb:
                logging.warning(f"数据库文件过大: {size_mb:.2f}MB")
            else:
                logging.info(f"数据库大小正常: {size_mb:.2f}MB")

def setup_monitoring():
    """设置定时任务"""
    backup_manager = DatabaseBackup()
    monitor = SystemMonitor()
    
    # 每天凌晨2点备份数据库
    schedule.every().day.at("02:00").do(backup_manager.create_backup)
    
    # 每30分钟检查一次系统健康
    schedule.every(30).minutes.do(monitor.check_health)
    
    # 每天检查一次数据库大小
    schedule.every().day.at("03:00").do(monitor.check_database_size)
    
    logging.info("监控系统已启动")
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/monitor.log'),
            logging.StreamHandler()
        ]
    )
    setup_monitoring()