/**
 * 纯前端失眠诊断系统
 * 基于中医证型理论的评分算法
 */

// 二元诊断维度配置（基于第10-19题）
const BINARY_DIAGNOSIS_CONFIG = {
  // 行维度：肝肠、血液、神内
  dimensions: {
    "肝肠": {
      questions: [10, 15], // 精神压力 + 身体症状
      scoring: {
        10: {"是": 1, "否": 0},  // 精神压力大/情绪紧张
        15: {  // 身体症状（多选）
          "时有耳鸣": 1,
          "时发痔疮，肛周瘙痒": 1,
          "腹胀/腹部不适": 1,
          "无": 0
        }
      }
    },
    "血液": {
      questions: [11, 16], // 周身酸痛 + 特殊症状  
      scoring: {
        11: {"是": 1, "否": 0},  // 周身酸痛/脊柱疼痛
        16: {  // 特殊症状（多选）
          "夜间憋醒/胸闷，心跳加速": 1,
          "皮肤瘙痒，发疹麻疹": 1,
          "咳嗽/气短/喘促等": 1,
          "无": 0
        }
      }
    },
    "神内": {
      questions: [12, 17], // 电子产品 + 中医症状
      scoring: {
        12: {"是": 1, "否": 0},  // 电子产品使用超过3小时/天
        17: {  // 中医症状（多选）
          "面色暗黑，无精打采": 1,
          "容易受惊，害怕": 1,
          "夜间盗汗": 1,
          "无": 0
        }
      }
    },
    "骨髓空虚": {
      questions: [13, 18], // 劳心耗神 + 肾虚症状
      scoring: {
        13: {"是": 1, "否": 0},  // 劳心耗神过度
        18: {  // 肾虚症状（多选）
          "腰酸无力": 1,
          "身寒怕冷": 1,
          "夜尿频繁": 1,
          "无": 0
        }
      }
    },
    "脑髓空虚": {
      questions: [14, 19], // 用脑过度 + 认知功能
      scoring: {
        14: {"是": 1, "否": 0},  // 用脑过度
        19: {  // 认知功能（多选）
          "好忘事，记忆力下降": 1,
          "白天嗜睡": 1,
          "偏头痛/头痛": 1,
          "无": 0
        }
      }
    }
  },
  
  // 二元诊断矩阵
  matrix: {
    "肝肠_骨髓空虚": "肝郁肾虚",
    "肝肠_脑髓空虚": "肝郁脑虚",
    "血液_骨髓空虚": "气血两虚", 
    "血液_脑髓空虚": "气滞血瘀",
    "神内_骨髓空虚": "精髓空虚",
    "神内_脑髓空虚": "神经衰弱"
  }
}

// 产品推荐规则（基于二元诊断结果）
const PRODUCT_RULES = {
  '肝郁肾虚': ['舒肝解郁茶包', '坚果营养包', '穴位贴'],
  '肝郁脑虚': ['舒肝解郁茶包', '鱼油胶囊', '穴位贴'],
  '气血两虚': ['补血活血茶包', '植物蛋白奶粉', '坚果营养包'],
  '气滞血瘀': ['补血活血茶包', '鱼油胶囊', '穴位贴'],
  '精髓空虚': ['安神定志茶包', '坚果营养包', '植物蛋白奶粉'],
  '神经衰弱': ['安神定志茶包', '鱼油胶囊', '穴位贴'],
  '睡眠质量优秀': ['继续保持良好的睡眠习惯'],
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
  const sleepQuality = getSleepQuality(totalScore, answers)
  
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
  
  try {
    answers.forEach(answer => {
      if (!answer || !answer.question) {
        console.warn('无效的答案数据:', answer)
        return
      }
      
      const selectedValues = answer.selectedValues || []
      const question = answer.question
      
      if (!question.options || question.options.length === 0) {
        console.warn('问题缺少选项:', question)
        return
      }
      
      // 计算当前问题的最大可能分数
      const questionMaxScore = Math.max(...question.options.map(opt => opt.score || 0))
      maxScore += questionMaxScore
      
      if (Array.isArray(selectedValues)) {
        // 多选题或单选题都用数组处理
        selectedValues.forEach(value => {
          const option = question.options.find(opt => opt.value === value)
          if (option) {
            totalScore += option.score || 0
          }
        })
      } else if (selectedValues) {
        // 单个值的情况
        const option = question.options.find(opt => opt.value === selectedValues)
        if (option) {
          totalScore += option.score || 0
        }
      }
    })
  } catch (error) {
    console.error('计算总分时出错:', error)
  }
  
  return {
    total_score: totalScore,
    max_possible_score: maxScore || 96
  }
}

/**
 * 获取睡眠质量等级
 */
function getSleepQuality(scoreData, answers) {
  const { total_score, max_possible_score } = scoreData
  const percentage = (total_score / max_possible_score) * 100
  
  // 检查第9题是否选择了长期用药
  let forceToWorst = false
  if (answers) {
    const question9Answer = answers.find(answer => answer.question && answer.question.id === 9)
    if (question9Answer && question9Answer.selectedValues) {
      const selectedValue = Array.isArray(question9Answer.selectedValues) 
        ? question9Answer.selectedValues[0] 
        : question9Answer.selectedValues
      // 如果选择了"半年以上"或包含"以上"字样，强制判定为"差"
      if (selectedValue && (selectedValue.includes('半年以上') || selectedValue.includes('以上'))) {
        forceToWorst = true
      }
    }
  }
  
  let grade = '差'
  if (forceToWorst) {
    grade = '差' // 强制设为差，建议就医
  } else {
    if (total_score >= 86) grade = '优'
    else if (total_score >= 70) grade = '良' 
    else if (total_score >= 55) grade = '中'
    else grade = '差'
  }
  
  return {
    ...scoreData,
    grade,
    percentage: Math.round(percentage),
    needs_medical_attention: forceToWorst // 添加标记，表示需要就医
  }
}

/**
 * 二元诊断分析（基于第10-19题）
 */
function analyzeSyndrome(answers) {
  const dimensions = {}
  
  // 计算各维度得分
  Object.keys(BINARY_DIAGNOSIS_CONFIG.dimensions).forEach(dimensionName => {
    const config = BINARY_DIAGNOSIS_CONFIG.dimensions[dimensionName]
    let dimensionScore = 0
    const questionDetails = {}
    
    config.questions.forEach(questionId => {
      const answer = answers.find(ans => ans.question && ans.question.id === questionId)
      if (answer && answer.selectedValues) {
        const selectedValues = Array.isArray(answer.selectedValues) 
          ? answer.selectedValues 
          : [answer.selectedValues]
        
        let questionScore = 0
        const selectedOptions = []
        
        selectedValues.forEach(value => {
          const optionScore = config.scoring[questionId][value] || 0
          questionScore += optionScore
          selectedOptions.push({
            option: value,
            score: optionScore
          })
        })
        
        dimensionScore += questionScore
        questionDetails[`问题${questionId}`] = {
          selected_options: selectedOptions,
          total_score: questionScore
        }
      }
    })
    
    dimensions[dimensionName] = {
      total_score: dimensionScore,
      question_details: questionDetails
    }
  })
  
  // 执行二元诊断：行×列交叉
  const rowDimensions = ['肝肠', '血液', '神内']
  const columnDimensions = ['骨髓空虚', '脑髓空虚']
  
  // 找到行维度中分数最低的（最小值）
  const minRowDimension = rowDimensions.reduce((min, curr) => {
    const minScore = dimensions[min] ? dimensions[min].total_score : Infinity
    const currScore = dimensions[curr] ? dimensions[curr].total_score : Infinity
    return currScore < minScore ? curr : min
  })
  
  // 找到列维度中分数最低的（最小值）
  const minColumnDimension = columnDimensions.reduce((min, curr) => {
    const minScore = dimensions[min] ? dimensions[min].total_score : Infinity
    const currScore = dimensions[curr] ? dimensions[curr].total_score : Infinity
    return currScore < minScore ? curr : min
  })
  
  // 矩阵交叉获取最终诊断
  const matrixKey = `${minRowDimension}_${minColumnDimension}`
  const finalDiagnosis = BINARY_DIAGNOSIS_CONFIG.matrix[matrixKey] || '未知证型'
  
  // 计算置信度
  const totalScore = Object.values(dimensions).reduce((sum, dim) => sum + dim.total_score, 0)
  const confidence = Math.max(0.6, Math.min(0.95, totalScore / 10))
  
  return {
    final_diagnosis: finalDiagnosis,
    primary_syndrome: minRowDimension,
    secondary_syndrome: minColumnDimension,
    confidence,
    dimension_analysis: dimensions,
    binary_diagnosis: {
      row_dimension: minRowDimension,
      row_score: dimensions[minRowDimension]?.total_score || 0,
      column_dimension: minColumnDimension,
      column_score: dimensions[minColumnDimension]?.total_score || 0,
      matrix_key: matrixKey
    }
  }
}

/**
 * 生成治疗方案
 */
function generateTreatmentPlan(syndromeDiagnosis, sleepQuality) {
  const diagnosis = syndromeDiagnosis.final_diagnosis
  let treatmentType = '轻度调理'
  let needsProfessional = false
  
  // 检查是否因为长期用药需要就医
  if (sleepQuality.needs_medical_attention) {
    treatmentType = '专业医疗'
    needsProfessional = true
  } else {
    // 根据睡眠质量确定治疗强度
    if (sleepQuality.total_score >= 40) {
      treatmentType = '重度调理'
      needsProfessional = true
    } else if (sleepQuality.total_score >= 20) {
      treatmentType = '中度调理'
    }
  }
  
  // 选择产品
  const products = PRODUCT_RULES[diagnosis] || PRODUCT_RULES['通用型']
  
  let instructions = ''
  if (sleepQuality.needs_medical_attention) {
    instructions = '检测到您长期使用安眠药，建议立即咨询专业医生，制定科学的停药和治疗计划。'
  } else if (needsProfessional) {
    instructions = '您的睡眠问题较为严重，建议在使用产品的同时咨询专业健康顾问。'
  } else {
    instructions = `根据您的${diagnosis}诊断，推荐使用以下产品组合，坚持使用2-4周可见明显效果。`
  }
  
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