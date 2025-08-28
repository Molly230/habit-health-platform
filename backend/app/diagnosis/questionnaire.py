"""
简化的问卷管理
前端已实现完整的19题问卷和诊断逻辑，后端只提供基础支持
"""
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum

class QuestionType(Enum):
    SINGLE_CHOICE = "单选"
    MULTIPLE_CHOICE = "多选"

class InsomniaQuestionnaire:
    """简化的失眠问诊表管理"""
    
    # 问卷元信息
    TOTAL_QUESTIONS = 19
    MAX_SCORE = 96
    
    @classmethod
    def get_questions_count(cls):
        """返回题目总数"""
        return cls.TOTAL_QUESTIONS
    
    @classmethod
    def get_max_score(cls):
        """返回最高分"""
        return cls.MAX_SCORE
    
    @classmethod
    def validate_answers_count(cls, answers: List[dict]) -> bool:
        """验证答案数量是否正确"""
        return len(answers) == cls.TOTAL_QUESTIONS
    
    @classmethod
    def validate_answers_format(cls, answers: List[dict]) -> bool:
        """验证答案格式"""
        if not answers or len(answers) != cls.TOTAL_QUESTIONS:
            return False
            
        for answer in answers:
            if not isinstance(answer, dict):
                return False
            if 'question_id' not in answer or 'selected_options' not in answer:
                return False
                
        return True
    
    @classmethod
    def create_response_template(cls):
        """创建响应模板"""
        return {
            "total_questions": cls.TOTAL_QUESTIONS,
            "max_score": cls.MAX_SCORE,
            "note": "问卷和评分逻辑由前端处理，后端仅提供数据存储支持"
        }