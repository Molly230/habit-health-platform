/**
 * 纯前端失眠诊断系统
 * 基于中医证型理论的评分算法
 */

// 中医证型维度定义
const TCM_DIMENSIONS = {
  '肝郁': ['精神压力大', '情绪紧张', '反复清醒'],
  '心火': ['整夜做梦', '心跳加速', '夜间憋醒'],
  '脾虚': ['晨起疲乏', '腹胀', '身寒怕冷'],
  '肾虚': ['腰酸无力', '夜尿频繁', '好忘事'],
  '血瘀': ['偏头痛', '面色暗黑', '周身酸痛'],
  '痰湿': ['白天嗜睡', '咳嗽气短', '身体沉重']
}

// 产品推荐规则
const PRODUCT_RULES = {
  '肝郁脾虚型': ['舒肝解郁茶包', '植物蛋白奶粉', '穴位贴'],
  '心火亢盛型': ['安神定志茶包', '鱼油胶囊', '穴位贴'], 
  '肾精不足型': ['补血活血茶包', '坚果营养包', '植物蛋白奶粉'],
  '血瘀痰阻型': ['通用安眠茶包', '鱼油胶囊', '坚果营养包'],
  '通用型': ['通用安眠茶包', '植物蛋白奶粉', '穴位贴']
}

/**
 * 静态诊断分析
 * @param {Array} answers - 用户答案数组
 * @returns {Object} 诊断结果
 */
export function analyzeStaticDiagnosis(answers) {
  // 1. 计算总分和睡眠质量
  const totalScore = calculateTotalScore(answers)
  const sleepQuality = getSleepQuality(totalScore)
  
  // 2. 证型分析
  const syndromeDiagnosis = analyzeSyndrome(answers)
  
  // 3. 治疗方案
  const treatmentPlan = generateTreatmentPlan(syndromeDiagnosis, sleepQuality)
  
  return {
    sleep_quality: sleepQuality,
    syndrome_diagnosis: syndromeDiagnosis,
    treatment_plan: treatmentPlan,
    analysis_time: new Date().toISOString()
  }
}

/**
 * 计算总分
 */
function calculateTotalScore(answers) {
  let totalScore = 0
  let maxScore = 0
  
  answers.forEach(answer => {
    if (Array.isArray(answer.selectedValues)) {
      // 多选题
      answer.selectedValues.forEach(value => {
        const option = answer.question.options.find(opt => opt.value === value)
        if (option) {
          totalScore += option.score || 0
        }
      })
      maxScore += Math.max(...answer.question.options.map(opt => opt.score || 0))
    } else {
      // 单选题
      const option = answer.question.options.find(opt => opt.value === answer.selectedValues)
      if (option) {
        totalScore += option.score || 0
      }
      maxScore += Math.max(...answer.question.options.map(opt => opt.score || 0))
    }
  })
  
  return {
    total_score: totalScore,
    max_possible_score: maxScore || 64
  }
}

/**
 * 获取睡眠质量等级
 */
function getSleepQuality(scoreData) {
  const { total_score, max_possible_score } = scoreData
  const percentage = (total_score / max_possible_score) * 100
  
  let grade = '中'
  if (total_score >= 54) grade = '优'
  else if (total_score >= 34) grade = '良' 
  else if (total_score >= 0) grade = '中'
  else grade = '差'
  
  return {
    ...scoreData,
    grade,
    percentage: Math.round(percentage)
  }
}

/**
 * 证型分析
 */
function analyzeSyndrome(answers) {
  const dimensions = {}
  
  // 初始化维度得分
  Object.keys(TCM_DIMENSIONS).forEach(dim => {
    dimensions[dim] = 0
  })
  
  // 根据答案计算各维度得分
  answers.forEach(answer => {
    const category = answer.question.category
    const selectedValues = Array.isArray(answer.selectedValues) 
      ? answer.selectedValues 
      : [answer.selectedValues]
    
    selectedValues.forEach(value => {
      // 根据症状关键词匹配维度
      Object.keys(TCM_DIMENSIONS).forEach(dimension => {
        const keywords = TCM_DIMENSIONS[dimension]
        if (keywords.some(keyword => 
          value.includes(keyword) || 
          answer.question.text.includes(keyword)
        )) {
          const option = answer.question.options.find(opt => opt.value === value)
          if (option) {
            dimensions[dimension] += option.score || 1
          }
        }
      })
    })
  })
  
  // 找出主要和次要证型
  const sortedDimensions = Object.entries(dimensions)
    .sort(([,a], [,b]) => b - a)
  
  const primarySyndrome = sortedDimensions[0][0]
  const secondarySyndrome = sortedDimensions[1][0]
  
  // 组合诊断
  const finalDiagnosis = `${primarySyndrome}${secondarySyndrome}型失眠`
  const confidence = Math.max(0.6, Math.min(0.95, 
    (sortedDimensions[0][1] + sortedDimensions[1][1]) / 20
  ))
  
  return {
    final_diagnosis: finalDiagnosis,
    primary_syndrome: primarySyndrome,
    secondary_syndrome: secondarySyndrome,
    confidence,
    dimension_analysis: dimensions
  }
}

/**
 * 生成治疗方案
 */
function generateTreatmentPlan(syndromeDiagnosis, sleepQuality) {
  const diagnosis = syndromeDiagnosis.final_diagnosis
  let treatmentType = '轻度调理'
  let needsProfessional = false
  
  // 根据睡眠质量确定治疗强度
  if (sleepQuality.total_score >= 40) {
    treatmentType = '重度调理'
    needsProfessional = true
  } else if (sleepQuality.total_score >= 20) {
    treatmentType = '中度调理'
  }
  
  // 选择产品
  const products = PRODUCT_RULES[diagnosis] || PRODUCT_RULES['通用型']
  
  const instructions = needsProfessional 
    ? '您的睡眠问题较为严重，建议在使用产品的同时咨询专业健康顾问。'
    : `根据您的${diagnosis}诊断，推荐使用以下产品组合，坚持使用2-4周可见明显效果。`
  
  return {
    treatment_type: treatmentType,
    products,
    instructions,
    needs_professional: needsProfessional
  }
}

export default {
  analyzeStaticDiagnosis
}