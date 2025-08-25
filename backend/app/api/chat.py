from flask import Blueprint, request, jsonify
import uuid
import datetime
import re

chat_bp = Blueprint('chat', __name__)

class TCMChatBot:
    """基于规则的中医智能问答机器人"""
    
    # 中医失眠相关的知识库
    KNOWLEDGE_BASE = {
        "失眠原因": {
            "keywords": ["失眠", "睡不着", "入睡困难", "夜醒", "早醒"],
            "response": """失眠的中医病因主要包括：

🔹 **情志因素**：思虑过度、忧愁恼怒、精神紧张
🔹 **饮食因素**：暴饮暴食、过食肥甘厚味
🔹 **劳逸因素**：劳心过度、房事不节
🔹 **病后体虚**：久病耗伤气血阴液

**中医认为失眠主要由"心神失养"或"心神不安"导致。**"""
        },
        
        "证型分类": {
            "keywords": ["证型", "辨证", "分型", "类型"],
            "response": """中医将失眠分为以下主要证型：

🟡 **肝郁肾虚型**：情绪低落、腰膝酸软
🟡 **气血两虚型**：面色萎黄、心悸健忘  
🟡 **阴虚火旺型**：五心烦热、盗汗口干
🟡 **脾肾阳虚型**：畏寒怕冷、精神萎靡
🟡 **肝郁脾虚型**：情绪波动、消化不良
🟡 **瘀血内阻型**：胸闷痛、舌质紫暗

**建议通过专业问卷进行精确辨证！**"""
        },
        
        "穴位治疗": {
            "keywords": ["穴位", "按摩", "针灸", "推拿", "外治"],
            "response": """失眠常用穴位治疗：

🎯 **基础穴位**（所有失眠都可用）：
• **神门**：安神定志，每日按摩5-10分钟
• **三阴交**：调理脾肾，睡前按摩
• **涌泉**：引火归元，温水泡脚后按摩

🎯 **辨证配穴**：
• 心肾不交：加心俞、肾俞
• 肝郁化火：加太冲、行间
• 脾胃不和：加足三里、中脘

**按摩方法**：用拇指指腹按压，每个穴位1-2分钟，以有酸胀感为度。"""
        },
        
        "食疗建议": {
            "keywords": ["食疗", "饮食", "吃什么", "食物", "营养"],
            "response": """失眠的食疗调理：

🍵 **安神茶饮**：
• 酸枣仁茶：养心安神
• 百合莲子茶：清心润燥
• 玫瑰花茶：疏肝解郁

🥣 **食疗方**：
• 小米红枣粥：健脾安神
• 莲子百合汤：清心除烦
• 银耳莲子羹：滋阴润燥

⚠️ **饮食禁忌**：
• 避免晚餐过饱
• 少吃辛辣刺激食物
• 戒烟酒、少喝浓茶咖啡
• 睡前3小时避免大量进食"""
        },
        
        "生活调理": {
            "keywords": ["生活", "作息", "习惯", "调理", "养生"],
            "response": """失眠的生活调理要点：

🌙 **作息调节**：
• 固定睡眠时间，建立生物钟
• 晚上9-11点入睡最佳
• 避免白天长时间午睡

🧘 **情志调摄**：
• 保持心情舒畅，避免过度焦虑
• 睡前冥想或深呼吸放松
• 学会释放压力

🏃 **运动锻炼**：
• 适量有氧运动，如散步、太极
• 避免睡前激烈运动
• 坚持规律运动习惯

🛏️ **睡眠环境**：
• 保持卧室安静、黑暗、凉爽
• 选择舒适的床品
• 避免在床上看手机、电视"""
        },
        
        "用药指导": {
            "keywords": ["药物", "中药", "西药", "安眠药", "副作用"],
            "response": """关于失眠用药的建议：

💊 **西药使用**：
• 安眠药只能短期使用
• 长期依赖会产生耐药性
• 必须在医生指导下使用

🌿 **中药调理**：
• 需要根据证型选择方剂
• 常用方：甘麦大枣汤、酸枣仁汤等
• 建议找专业中医师开方

⚠️ **重要提醒**：
• 不可自行随意用药
• 任何药物都可能有副作用
• 中西医结合效果更好
• 严重失眠请及时就医"""
        },
        
        "默认回复": {
            "keywords": [],
            "response": """我是您的中医健康顾问，专注于失眠相关的健康指导。

您可以咨询以下内容：
🔸 失眠的原因和证型
🔸 穴位按摩和针灸治疗
🔸 食疗和生活调理
🔸 用药指导和注意事项

如需精确的证型判断，建议您完成我们的专业问卷诊断。

**⚠️ 重要提醒：以上建议仅供参考，不能替代专业医生诊断，如有严重症状请及时就医！**"""
        }
    }
    
    @classmethod
    def get_response(cls, user_message: str) -> str:
        """根据用户输入返回相应的回复"""
        user_message = user_message.lower().strip()
        
        # 遍历知识库，匹配关键词
        for topic, data in cls.KNOWLEDGE_BASE.items():
            if topic == "默认回复":
                continue
                
            keywords = data["keywords"]
            for keyword in keywords:
                if keyword in user_message:
                    return data["response"]
        
        # 如果没有匹配到，返回默认回复
        return cls.KNOWLEDGE_BASE["默认回复"]["response"]

@chat_bp.route('/message', methods=['POST'])
def send_message():
    """处理聊天消息"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': '请提供消息内容'
            }), 400
        
        user_message = data['message'].strip()
        user_id = data.get('userId', 'anonymous')
        conversation_id = data.get('conversationId', str(uuid.uuid4()))
        
        if not user_message:
            return jsonify({
                'success': False,
                'error': '消息不能为空'
            }), 400
        
        # 使用中医知识机器人生成回复
        bot_response = TCMChatBot.get_response(user_message)
        
        # 生成回复消息
        response_message = {
            'id': str(uuid.uuid4()),
            'content': bot_response,
            'timestamp': datetime.datetime.now().isoformat(),
            'role': 'assistant'
        }
        
        return jsonify({
            'success': True,
            'data': {
                'message': response_message,
                'conversationId': conversation_id,
                'userId': user_id
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'处理消息时发生错误: {str(e)}'
        }), 500

@chat_bp.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'success': True,
        'message': '中医智能助手服务正常',
        'timestamp': datetime.datetime.now().isoformat()
    })

@chat_bp.route('/knowledge', methods=['GET'])
def get_knowledge_topics():
    """获取知识库主题"""
    topics = []
    for topic, data in TCMChatBot.KNOWLEDGE_BASE.items():
        if topic != "默认回复":
            topics.append({
                'topic': topic,
                'keywords': data['keywords']
            })
    
    return jsonify({
        'success': True,
        'data': {
            'topics': topics,
            'total': len(topics)
        }
    })