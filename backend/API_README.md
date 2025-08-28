# 简化后端API接口文档

## 概述

本后端系统已简化为轻量级API服务，主要功能为：
- 数据验证和格式校验
- 可选的数据存储
- 基础信息提供
- 系统健康检查

**注意：** 诊断逻辑已迁移到前端(`src/utils/staticDiagnosis.js`)，后端不再处理复杂的评分和证型分析。

## 诊断API接口 (`/api/diagnosis`)

### 1. 获取问卷基本信息
```
GET /api/diagnosis/info
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "total_questions": 19,
    "max_score": 96,
    "note": "问卷和评分逻辑由前端处理，后端仅提供数据存储支持"
  }
}
```

### 2. 分析用户答案（数据验证）
```
POST /api/diagnosis/analyze
```

**请求体：**
```json
{
  "answers": [
    {
      "question_id": 1,
      "selected_options": ["较差"]
    },
    {
      "question_id": 2,
      "selected_options": ["60分钟以上"]
    }
    // ... 共19题
  ],
  "user_id": "user_20231201_143022",
  "diagnosis_result": {
    "sleep_quality": {
      "total_score": 25,
      "grade": "差",
      "percentage": 26
    },
    "syndrome_diagnosis": {
      "final_diagnosis": "肝郁肾虚",
      "dimension_analysis": { ... },
      "binary_diagnosis": { ... }
    },
    "treatment_plan": {
      "treatment_type": "重度调理",
      "products": ["舒肝解郁茶包", "坚果营养包", "穴位贴"]
    }
  }
}
```

**注意：** `diagnosis_result` 字段为可选，如果提供则会自动保存到数据库。

**响应示例：**
```json
{
  "success": true,
  "data": {
    "processed_at": "2023-12-01T14:30:22.123456",
    "note": "诊断逻辑由前端处理，后端仅提供数据验证和存储支持",
    "user_id": "user_20231201_143022",
    "answers_count": 19,
    "validation_status": "格式正确",
    "storage_result": {
      "success": true,
      "message": "诊断结果已成功保存到数据库",
      "session_id": "session_20231201_143022_user_20231201_143022",
      "record_id": 123
    }
  }
}
```

### 3. 验证答案格式
```
POST /api/diagnosis/validate
```

**请求体：**
```json
{
  "answers": [
    {
      "question_id": 1,
      "selected_options": ["较差"]
    }
    // ... 更多答案
  ]
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "count_valid": true,
    "format_valid": true,
    "is_valid": true,
    "answers_count": 19,
    "expected_count": 19
  }
}
```

### 4. 获取分级标准信息
```
GET /api/diagnosis/grades
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "max_score": 96,
    "grades": {
      "优": {"min_score": 86, "max_score": 96, "description": "睡眠质量优秀"},
      "良": {"min_score": 70, "max_score": 85, "description": "睡眠质量良好"},
      "中": {"min_score": 55, "max_score": 69, "description": "睡眠质量一般"},
      "差": {"min_score": 0, "max_score": 54, "description": "睡眠质量较差"}
    },
    "supported_diagnosis": ["肝郁肾虚", "肝郁脑虚", "气血两虚", "气滞血瘀", "精髓空虚", "神经衰弱"]
  }
}
```

### 5. 健康检查
```
GET /api/diagnosis/health
```

**响应示例：**
```json
{
  "status": "healthy",
  "service": "diagnosis_api",
  "version": "2.0_simplified",
  "timestamp": "2023-12-01T14:30:22.123456",
  "note": "前端处理诊断逻辑，后端提供基础支持"
}
```

## 错误响应格式

所有API在出错时返回统一格式：
```json
{
  "success": false,
  "error": "错误信息描述"
}
```

HTTP状态码：
- `200`: 成功
- `400`: 请求参数错误
- `500`: 服务器内部错误

## 前端数据格式

前端答案数据结构：
```javascript
const answers = [
  {
    question_id: 1,          // 题目ID (1-19)
    selected_options: ["好"]  // 选择的选项数组
  },
  {
    question_id: 7,                    // 多选题
    selected_options: ["反复清醒", "整夜做梦"]
  }
  // ...
]
```

## 评分逻辑说明

**后端不再处理评分逻辑**，所有评分和诊断分析由前端`src/utils/staticDiagnosis.js`处理：

1. **题目1-8**: 不同分值计算总分
2. **题目9**: 长期用药特殊处理
3. **题目10-19**: 二元诊断矩阵分析
4. **最终输出**: 睡眠质量等级 + 证型诊断 + 产品推荐

## 数据库存储

后端保留数据库功能，可选择存储：
- 用户答案原始数据
- 前端计算的诊断结果
- 时间戳和用户ID

## 部署说明

1. 安装依赖：`pip install -r requirements.txt`
2. 初始化数据库：`python init_database.py`  
3. 启动服务：`python run.py`
4. 健康检查：访问 `http://localhost:5000/api/health`