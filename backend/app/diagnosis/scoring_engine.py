"""
简化的评分引擎
前端已实现完整的二元诊断和评分逻辑，后端仅保留基础支持功能
"""
from typing import Dict, List, Optional
from datetime import datetime

class SimplifiedScoringEngine:
    """简化的评分引擎"""
    
    # 基础配置
    MAX_SCORE = 96
    TOTAL_QUESTIONS = 19
    
    # 睡眠质量分级标准
    SLEEP_QUALITY_GRADES = {
        "优": {"min_score": 86, "max_score": 96, "description": "睡眠质量优秀"},
        "良": {"min_score": 70, "max_score": 85, "description": "睡眠质量良好"},
        "中": {"min_score": 55, "max_score": 69, "description": "睡眠质量一般"},
        "差": {"min_score": 0, "max_score": 54, "description": "睡眠质量较差"}
    }
    
    # 支持的诊断类型
    SUPPORTED_DIAGNOSIS_TYPES = [
        "肝郁肾虚", "肝郁脑虚", "气血两虚", 
        "气滞血瘀", "精髓空虚", "神经衰弱"
    ]
    
    @classmethod
    def validate_score(cls, score: int) -> bool:
        """验证分数是否在有效范围内"""
        return 0 <= score <= cls.MAX_SCORE
    
    @classmethod
    def get_grade_by_score(cls, score: int) -> Optional[str]:
        """根据分数获取等级"""
        if not cls.validate_score(score):
            return None
            
        for grade, criteria in cls.SLEEP_QUALITY_GRADES.items():
            if criteria["min_score"] <= score <= criteria["max_score"]:
                return grade
        return None
    
    @classmethod
    def validate_diagnosis_type(cls, diagnosis: str) -> bool:
        """验证诊断类型是否支持"""
        return diagnosis in cls.SUPPORTED_DIAGNOSIS_TYPES
    
    @classmethod
    def create_simple_response(cls, user_data: Dict) -> Dict:
        """创建简化的响应格式"""
        return {
            "success": True,
            "data": {
                "processed_at": datetime.now().isoformat(),
                "note": "诊断逻辑由前端处理，后端仅提供数据验证和存储支持",
                "user_id": user_data.get("user_id"),
                "answers_count": len(user_data.get("answers", [])),
                "validation_status": "格式正确" if cls._validate_user_data(user_data) else "格式错误"
            }
        }
    
    @classmethod
    def _validate_user_data(cls, user_data: Dict) -> bool:
        """验证用户数据格式"""
        if not user_data or not isinstance(user_data, dict):
            return False
        
        answers = user_data.get("answers", [])
        return len(answers) == cls.TOTAL_QUESTIONS
    
    @classmethod
    def store_user_result(cls, user_id: str, result_data: Dict) -> Dict:
        """存储用户结果到数据库"""
        try:
            from app.models.database_models import DiagnosisRecord, db
            from app import db as app_db
            
            # 生成唯一session_id
            session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{user_id}"
            
            # 创建诊断记录
            diagnosis_record = DiagnosisRecord(
                session_id=session_id,
                questionnaire_answers=result_data.get('questionnaire_answers'),
                total_sleep_score=result_data.get('total_sleep_score'),
                sleep_quality_grade=result_data.get('sleep_quality_grade'),
                sleep_score_percentage=result_data.get('sleep_score_percentage'),
                final_diagnosis=result_data.get('final_diagnosis'),
                diagnosed_at=datetime.now()
            )
            
            # 设置JSON数据
            if result_data.get('syndrome_scores'):
                diagnosis_record.set_syndrome_scores(result_data['syndrome_scores'])
            if result_data.get('binary_diagnosis_details'):
                diagnosis_record.set_binary_diagnosis_details(result_data['binary_diagnosis_details'])
            if result_data.get('treatment_plan'):
                diagnosis_record.set_treatment_plan(result_data['treatment_plan'])
            
            # 保存到数据库
            app_db.session.add(diagnosis_record)
            app_db.session.commit()
            
            return {
                "success": True,
                "message": "诊断结果已成功保存到数据库",
                "user_id": user_id,
                "session_id": session_id,
                "record_id": diagnosis_record.id,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            # 如果保存失败，记录错误但不影响主流程
            import logging
            logging.error(f"保存诊断结果失败: {str(e)}")
            return {
                "success": False,
                "message": f"保存失败: {str(e)}",
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }