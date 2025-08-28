import axios from 'axios'
import { apiConfig } from '../config/api.js'

// 创建axios实例
const consultationHttp = axios.create({
  baseURL: `${apiConfig.baseURL}/consultation`,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
consultationHttp.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 咨询API错误
    return Promise.reject(error)
  }
)

// 19题硬编码健康评估问题
const hardcodedQuestions = [
  {
    id: 1,
    text: "您认为自己的睡眠状况如何？",
    type: "单选",
    category: "睡眠质量",
    options: [
      { value: "好", label: "好", score: 10 },
      { value: "一般", label: "一般", score: 5 },
      { value: "较差", label: "较差", score: 0 }
    ]
  },
  {
    id: 2,
    text: "通常情况下，您从上床准备睡觉到真正入睡需要多长时间？",
    type: "单选",
    category: "入睡时间",
    options: [
      { value: "5分钟以内", label: "5分钟以内", score: 0 },
      { value: "6-15分钟", label: "6-15分钟", score: 1 },
      { value: "16-30分钟", label: "16-30分钟", score: 2 },
      { value: "31-60分钟", label: "31-60分钟", score: 3 },
      { value: "60分钟以上", label: "60分钟以上", score: 4 }
    ]
  },
  {
    id: 3,
    text: "过去一个月内，您每天夜间睡眠时间有多长？",
    type: "单选",
    category: "睡眠时长",
    options: [
      { value: "8小时及以上", label: "8小时及以上", score: 12 },
      { value: "7-8小时", label: "7-8小时", score: 9 },
      { value: "6-7小时", label: "6-7小时", score: 6 },
      { value: "5-6小时", label: "5-6小时", score: 3 },
      { value: "5小时以下", label: "5小时以下", score: 0 }
    ]
  },
  {
    id: 4,
    text: "过去一个月内，您夜间平均醒来的次数大约是？",
    type: "单选",
    category: "夜醒次数",
    options: [
      { value: "几乎不醒来", label: "几乎不醒来", score: 9 },
      { value: "1次", label: "1次", score: 6 },
      { value: "2-3次", label: "2-3次", score: 3 },
      { value: "4次及以上", label: "4次及以上", score: 0 }
    ]
  },
  {
    id: 5,
    text: "过去一个月内，您夜间醒来后，再次入睡通常需要多长时间？",
    type: "单选",
    category: "睡眠困扰",
    options: [
      { value: "5分钟以内", label: "5分钟以内", score: 12 },
      { value: "6-15分钟", label: "6-15分钟", score: 9 },
      { value: "16-30分钟", label: "16-30分钟", score: 6 },
      { value: "31-60分钟", label: "31-60分钟", score: 3 },
      { value: "60分钟以上", label: "60分钟以上", score: 0 }
    ]
  },
  {
    id: 6,
    text: "过去一个月内，您是否会在白天出现不可抗拒的睡眠欲望（如工作、学习或开车时突然想睡觉）？",
    type: "单选",
    category: "睡眠困扰",
    options: [
      { value: "几乎没有", label: "几乎没有", score: 9 },
      { value: "每周1-2次", label: "每周1-2次", score: 6 },
      { value: "每周3-5次", label: "每周3-5次", score: 3 },
      { value: "每天都有", label: "每天都有", score: 0 }
    ]
  },
  {
    id: 7,
    text: "您有怎样的睡眠困扰？（多选）",
    type: "多选",
    category: "睡眠困扰",
    options: [
      { value: "反复清醒", label: "反复清醒", score: -3 },
      { value: "整夜做梦", label: "整夜做梦", score: -3 },
      { value: "晨起疲乏", label: "晨起疲乏", score: -3 },
      { value: "难以入睡", label: "难以入睡", score: -3 },
      { value: "无", label: "无", score: 0 }
    ]
  },
  {
    id: 8,
    text: "您是否服用过以下类药物？（多选）",
    type: "多选",
    category: "用药史",
    options: [
      { value: "苯二氮卓类：地西泮、劳拉西泮", label: "苯二氮卓类：地西泮、劳拉西泮", score: -4 },
      { value: "非苯二氮卓类：唑吡坦、右佐匹克隆", label: "非苯二氮卓类：唑吡坦、右佐匹克隆", score: -4 },
      { value: "褪黑素受体激动剂：雷美替胺", label: "褪黑素受体激动剂：雷美替胺", score: -4 },
      { value: "食欲素受体拮抗剂：苏沃雷生", label: "食欲素受体拮抗剂：苏沃雷生", score: -4 },
      { value: "抗抑郁药物：曲唑酮、米氮平", label: "抗抑郁药物：曲唑酮、米氮平", score: -4 },
      { value: "无", label: "无", score: 0 }
    ]
  },
  {
    id: 9,
    text: "如果服用过安眠药，大概多长时间？",
    type: "单选",
    category: "用药时长",
    options: [
      { value: "从未服用", label: "从未服用", score: 0 },
      { value: "1个月以内", label: "1个月以内", score: 1 },
      { value: "1-6个月", label: "1-6个月", score: 2 },
      { value: "半年以上", label: "半年以上", score: 3 }
    ]
  },
  {
    id: 10,
    text: "您是否经常精神压力大/情绪紧张？",
    type: "单选",
    category: "精神状态",
    options: [
      { value: "是", label: "是", score: 1 },
      { value: "否", label: "否", score: 0 }
    ]
  },
 {
    id: 11,
    text: "您是否经常周身酸痛/脊柱疼痛？",
    type: "单选",
    category: "疼痛症状",
    options: [
      { value: "是", label: "是", score: 1 },
      { value: "否", label: "否", score: 0 }
    ]
  }, 
  {
    id: 12,
    text: "您是否接触电子产品超过3小时/天？",
    type: "单选",
    category: "生活习惯",
    options: [
      { value: "是", label: "是", score: 1 },
      { value: "否", label: "否", score: 0 }
    ]
  },
  {
    id: 13,
    text: "您是否劳心耗神过度？",
    type: "单选",
    category: "精神消耗",
    options: [
      { value: "是", label: "是", score: 1 },
      { value: "否", label: "否", score: 0 }
    ]
  },
  {
    id: 14,
    text: "您是否用脑过度？",
    type: "单选",
    category: "用脑过度",
    options: [
      { value: "是", label: "是", score: 1 },
      { value: "否", label: "否", score: 0 }
    ]
  },
  {
    id: 15,
    text: "您近期有无如下问题？",
    type: "多选",
    category: "身体症状",
    options: [
      { value: "时有耳鸣", label: "时有耳鸣", score: 1 },
      { value: "时发痔疮，肛周瘙痒", label: "时发痔疮，肛周瘙痒", score: 1 },
      { value: "腹胀/腹部不适", label: "腹胀/腹部不适", score: 1 },
      { value: "无", label: "无", score: 0 }
    ]
  },
  {
    id: 16,
    text: "您近期有无如下问题？",
    type: "多选",
    category: "特殊症状",
    options: [
      { value: "夜间憋醒/胸闷，心跳加速", label: "夜间憋醒/胸闷，心跳加速", score: 1 },
      { value: "皮肤瘙痒，发疹麻疹", label: "皮肤瘙痒，发疹麻疹", score: 1 },
      { value: "咳嗽/气短/喘促等", label: "咳嗽/气短/喘促等", score: 1 },
      { value: "无", label: "无", score: 0 }
    ]
  },
  {
    id: 17,
    text: "您近期有无如下问题？",
    type: "多选",
    category: "中医症状",
    options: [
      { value: "面色暗黑，无精打采", label: "面色暗黑，无精打采", score: 1 },
      { value: "容易受惊，害怕", label: "容易受惊，害怕", score: 1 },
      { value: "夜间盗汗", label: "夜间盗汗", score: 1 },
      { value: "无", label: "无", score: 0 }
    ]
  },
  {
    id: 18,
    text: "您近期有无如下问题？",
    type: "多选",
    category: "肾虚症状",
    options: [
      { value: "腰酸无力", label: "腰酸无力", score: 1 },
      { value: "身寒怕冷", label: "身寒怕冷", score: 1 },
      { value: "夜尿频繁", label: "夜尿频繁", score: 1 },
      { value: "无", label: "无", score: 0 }
    ]
  },
  {
    id: 19,
    text: "您近期有无如下问题？",
    type: "多选",
    category: "认知功能",
    options: [
      { value: "好忘事，记忆力下降", label: "好忘事，记忆力下降", score: 1 },
      { value: "白天嗜睡", label: "白天嗜睡", score: 1 },
      { value: "偏头痛/头痛", label: "偏头痛/头痛", score: 1 },
      { value: "无", label: "无", score: 0 }
    ]
  },
]

// 获取19题硬编码问诊
export const getQuestions = async () => {
  try {
    return {
      success: true,
      data: hardcodedQuestions,
      total_questions: hardcodedQuestions.length
    }
  } catch (error) {
    // 获取问题失败
    throw new Error('无法获取健康评估问题，请重试')
  }
}

// 提交问卷答案并获取评估结果
export const submitQuestionnaireAnswers = async (answers) => {
  try {
    // 调用评估API（仅做基础验证）
    const assessmentHttp = axios.create({
      baseURL: `${apiConfig.baseURL}/diagnosis`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const response = await assessmentHttp.post('/analyze', {
      answers: answers,
      user_id: 'user-' + Date.now()
    })
    
    // 保存评估结果到本地存储
    if (response.success) {
      localStorage.setItem('latestAssessment', JSON.stringify(response.data))
      localStorage.setItem('latestAssessmentTime', new Date().toISOString())
    }
    
    return response
    
  } catch (error) {
    // 提交问卷失败
    throw new Error('健康评估失败，请重试')
  }
}

// 保存诊断结果到后端数据库
export const saveDiagnosisResult = async (answers, diagnosisResult) => {
  try {
    const assessmentHttp = axios.create({
      baseURL: `${apiConfig.baseURL}/diagnosis`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const response = await assessmentHttp.post('/analyze', {
      answers: answers,
      diagnosis_result: diagnosisResult,
      user_id: 'user-' + Date.now()
    })
    
    return response
    
  } catch (error) {
    console.warn('保存诊断结果失败，但不影响用户使用:', error)
    // 保存失败不抛出错误，不影响用户体验
    return { success: false, error: error.message }
  }
}

export default { getQuestions, submitQuestionnaireAnswers, saveDiagnosisResult }