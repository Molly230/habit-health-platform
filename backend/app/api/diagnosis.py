"""
简化的诊断API
前端已实现完整诊断逻辑，后端仅提供数据验证和可选的存储功能
"""
from flask import Blueprint, request, jsonify
from app.diagnosis.scoring_engine import SimplifiedScoringEngine
from app.diagnosis.questionnaire import InsomniaQuestionnaire
from datetime import datetime
import logging

diagnosis_bp = Blueprint('diagnosis', __name__)

@diagnosis_bp.route('/info', methods=['GET'])
def get_questionnaire_info():
    """获取问卷基本信息"""
    try:
        info = InsomniaQuestionnaire.create_response_template()
        return jsonify({
            'success': True,
            'data': info
        })
    except Exception as e:
        logging.error(f"获取问卷信息失败: {e}")
        return jsonify({
            'success': False,
            'error': '获取问卷信息失败'
        }), 500

@diagnosis_bp.route('/analyze', methods=['POST'])
def analyze_user():
    """接收用户答案并进行基础验证（实际诊断由前端处理）"""
    try:
        data = request.get_json()
        
        # 基础数据验证
        if not data:
            return jsonify({
                'success': False,
                'error': '请提供数据'
            }), 400
        
        answers = data.get('answers', [])
        user_id = data.get('user_id', f'user_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
        
        # 验证答案格式
        if not InsomniaQuestionnaire.validate_answers_format(answers):
            return jsonify({
                'success': False,
                'error': '答案格式不正确'
            }), 400
        
        # 创建响应
        response = SimplifiedScoringEngine.create_simple_response({
            'user_id': user_id,
            'answers': answers
        })
        
        # 如果前端传递了诊断结果，则保存到数据库
        diagnosis_result = data.get('diagnosis_result')
        if diagnosis_result:
            # 准备保存的数据
            save_data = {
                'questionnaire_answers': answers,
                'total_sleep_score': diagnosis_result.get('sleep_quality', {}).get('total_score', 0),
                'sleep_quality_grade': diagnosis_result.get('sleep_quality', {}).get('grade', '未知'),
                'sleep_score_percentage': diagnosis_result.get('sleep_quality', {}).get('percentage', 0),
                'final_diagnosis': diagnosis_result.get('syndrome_diagnosis', {}).get('final_diagnosis', '未知'),
                'syndrome_scores': diagnosis_result.get('syndrome_diagnosis', {}).get('dimension_analysis', {}),
                'binary_diagnosis_details': diagnosis_result.get('syndrome_diagnosis', {}).get('binary_diagnosis', {}),
                'treatment_plan': diagnosis_result.get('treatment_plan', {})
            }
            
            # 保存诊断结果
            store_result = SimplifiedScoringEngine.store_user_result(user_id, save_data)
            response['data']['storage_result'] = store_result
        
        return jsonify(response)
        
    except Exception as e:
        logging.error(f"分析处理失败: {e}")
        return jsonify({
            'success': False,
            'error': '分析处理失败，请重试'
        }), 500

@diagnosis_bp.route('/validate', methods=['POST'])
def validate_answers():
    """验证答案格式是否正确"""
    try:
        data = request.get_json()
        
        if not data or 'answers' not in data:
            return jsonify({
                'success': False,
                'error': '请提供答案数据'
            }), 400
        
        answers = data['answers']
        
        # 验证答案数量
        count_valid = InsomniaQuestionnaire.validate_answers_count(answers)
        format_valid = InsomniaQuestionnaire.validate_answers_format(answers)
        
        return jsonify({
            'success': True,
            'data': {
                'count_valid': count_valid,
                'format_valid': format_valid,
                'is_valid': count_valid and format_valid,
                'answers_count': len(answers),
                'expected_count': InsomniaQuestionnaire.get_questions_count()
            }
        })
        
    except Exception as e:
        logging.error(f"验证失败: {e}")
        return jsonify({
            'success': False,
            'error': '验证失败'
        }), 500

@diagnosis_bp.route('/grades', methods=['GET'])
def get_grade_info():
    """获取分级标准信息"""
    try:
        return jsonify({
            'success': True,
            'data': {
                'max_score': SimplifiedScoringEngine.MAX_SCORE,
                'grades': SimplifiedScoringEngine.SLEEP_QUALITY_GRADES,
                'supported_diagnosis': SimplifiedScoringEngine.SUPPORTED_DIAGNOSIS_TYPES
            }
        })
    except Exception as e:
        logging.error(f"获取分级信息失败: {e}")
        return jsonify({
            'success': False,
            'error': '获取分级信息失败'
        }), 500

# 健康检查端点
@diagnosis_bp.route('/health', methods=['GET'])
def health_check():
    """API健康检查"""
    return jsonify({
        'status': 'healthy',
        'service': 'diagnosis_api',
        'version': '2.0_simplified',
        'timestamp': datetime.now().isoformat(),
        'note': '前端处理诊断逻辑，后端提供基础支持'
    })