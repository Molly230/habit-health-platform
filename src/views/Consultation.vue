<template>
  <div class="consultation">
    <el-card class="consultation-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Edit /></el-icon>
          <span>智能问诊</span>
          <div class="progress-info">
            问题 {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
          </div>
        </div>
      </template>

      <!-- 进度条 -->
      <el-progress 
        :percentage="progressPercentage" 
        :stroke-width="8"
        status="success"
        class="progress-bar"
      />

      <!-- 问题内容 -->
      <div v-if="!isLoading && currentQuestion" class="question-section">
        <div class="question-header">
          <h3>{{ currentQuestion.text }}</h3>
          <el-tag :type="getQuestionTypeColor(currentQuestion.category)">
            {{ currentQuestion.category }}
          </el-tag>
        </div>

        <!-- 单选题 -->
        <div v-if="currentQuestion.type === '单选'" class="options-section">
          <el-radio-group 
            v-model="currentAnswer" 
            @change="handleAnswerChange"
            class="radio-group"
          >
            <el-row :gutter="20" justify="start">
              <el-col 
                :span="getColSpan(currentQuestion.options.length)"
                v-for="option in currentQuestion.options" 
                :key="option.value"
                class="option-col"
              >
                <el-radio 
                  :label="option.value"
                  class="radio-option"
                >
                  {{ option.label }}
                </el-radio>
              </el-col>
            </el-row>
          </el-radio-group>
        </div>

        <!-- 多选题 -->
        <div v-else-if="currentQuestion.type === '多选'" class="options-section">
          <el-checkbox-group 
            v-model="currentMultipleAnswers" 
            @change="handleMultipleAnswerChange"
            class="checkbox-group"
          >
            <el-row :gutter="20" justify="start">
              <el-col 
                :span="getColSpan(currentQuestion.options.length)"
                v-for="option in currentQuestion.options" 
                :key="option.value"
                class="option-col"
              >
                <el-checkbox 
                  :label="option.value"
                  class="checkbox-option"
                >
                  {{ option.label }}
                </el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </div>

        <!-- 导航按钮 -->
        <div class="navigation-buttons">
          <el-button 
            @click="previousQuestion" 
            :disabled="currentQuestionIndex === 0"
          >
            <el-icon><ArrowLeft /></el-icon>
            上一题
          </el-button>
          
          <el-button 
            v-if="currentQuestionIndex < totalQuestions - 1"
            type="primary" 
            @click="nextQuestion"
            :disabled="!hasAnswer"
          >
            下一题
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          
          <el-button 
            v-else
            type="success" 
            @click="submitAnswers"
            :disabled="!hasAnswer"
            :loading="isSubmitting"
          >
            提交问诊
            <el-icon><Check /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="isLoading" class="loading-section">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 完成状态 -->
      <div v-else-if="isCompleted" class="completed-section">
        <el-result
          icon="success"
          title="问诊完成"
          sub-title="正在分析您的症状，请稍候..."
        >
          <template #extra>
            <el-button type="primary" @click="viewResults">
              查看诊断结果
              <el-icon><Right /></el-icon>
            </el-button>
          </template>
        </el-result>
      </div>

      <!-- 优秀睡眠质量结果 -->
      <div v-else-if="showExcellentResult" class="excellent-result-section">
        <el-result
          icon="success"
          title="🎉 恭喜您！"
          sub-title="您的睡眠质量非常好！"
          class="excellent-result"
        >
          <template #extra>
            <div class="excellent-content">
              <div class="score-display">
                <div class="score-circle">
                  <span class="score-number">96</span>
                  <span class="score-text">/96分</span>
                </div>
                <div class="grade-badge">优秀</div>
              </div>
              <div class="congratulations-text">
                <p>🌟 您拥有理想的睡眠质量</p>
                <p>💪 请继续保持良好的睡眠习惯</p>
                <p>😴 规律作息，健康生活</p>
              </div>
              <el-button type="primary" size="large" @click="router.push('/diagnosis')">
                查看详细报告
                <el-icon><Right /></el-icon>
              </el-button>
            </div>
          </template>
        </el-result>
      </div>
    </el-card>

    <!-- 答题进度 -->
    <el-card class="answer-summary" shadow="hover" v-if="!isLoading && !isCompleted && !showExcellentResult">
      <template #header>
        <div class="summary-header">
          <el-icon><List /></el-icon>
          <span>答题进度</span>
        </div>
      </template>
      
      <div class="answer-grid">
        <div 
          v-for="(answer, index) in allAnswers" 
          :key="index"
          class="answer-item"
          :class="{ 
            'answered': answer.length > 0, 
            'current': index === currentQuestionIndex 
          }"
          @click="jumpToQuestion(index)"
        >
          {{ index + 1 }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Edit, ArrowLeft, ArrowRight, Check, Right, List 
} from '@element-plus/icons-vue'
import { getQuestions, submitQuestionnaireAnswers } from '../api/consultation'

const router = useRouter()

// 响应式数据
const isLoading = ref(true)
const isSubmitting = ref(false)
const isCompleted = ref(false)
const showExcellentResult = ref(false)
const questions = ref([])
const currentQuestionIndex = ref(0)
const allAnswers = ref([])

// 当前答案
const currentAnswer = ref('')
const currentMultipleAnswers = ref([])

// 计算属性
const totalQuestions = computed(() => questions.value.length)
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const progressPercentage = computed(() => 
  Math.round(((currentQuestionIndex.value + 1) / totalQuestions.value) * 100)
)

const hasAnswer = computed(() => {
  if (!currentQuestion.value) return false
  
  if (currentQuestion.value.type === '单选') {
    return currentAnswer.value !== ''
  } else if (currentQuestion.value.type === '多选') {
    return currentMultipleAnswers.value.length > 0
  }
  return false
})

// 方法
const loadQuestions = async () => {
  try {
    const response = await getQuestions()
    questions.value = response.data
    // 初始化答案数组
    allAnswers.value = Array(questions.value.length).fill([])
    isLoading.value = false
  } catch (error) {
    ElMessage.error('加载问题失败')
  }
}

const handleAnswerChange = (value) => {
  allAnswers.value[currentQuestionIndex.value] = [value]
  
  // 检查第1题是否选择了"好"
  if (currentQuestionIndex.value === 0 && value === '好') {
    // 第1题选择"好"，直接跳出并显示恭喜信息
    showExcellentSleepResult()
  }
}

const handleMultipleAnswerChange = (values) => {
  allAnswers.value[currentQuestionIndex.value] = values
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    saveCurrentAnswer()
    currentQuestionIndex.value++
    loadQuestionAnswer()
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    saveCurrentAnswer()
    currentQuestionIndex.value--
    loadQuestionAnswer()
  }
}

const jumpToQuestion = (index) => {
  if (index >= 0 && index < totalQuestions.value) {
    saveCurrentAnswer()
    currentQuestionIndex.value = index
    loadQuestionAnswer()
  }
}

const saveCurrentAnswer = () => {
  if (currentQuestion.value.type === '单选') {
    allAnswers.value[currentQuestionIndex.value] = currentAnswer.value ? [currentAnswer.value] : []
  } else if (currentQuestion.value.type === '多选') {
    allAnswers.value[currentQuestionIndex.value] = [...currentMultipleAnswers.value]
  }
}

const loadQuestionAnswer = () => {
  const answers = allAnswers.value[currentQuestionIndex.value] || []
  
  if (currentQuestion.value.type === '单选') {
    currentAnswer.value = answers[0] || ''
  } else if (currentQuestion.value.type === '多选') {
    currentMultipleAnswers.value = [...answers]
  }
}

const submitAnswers = async () => {
  saveCurrentAnswer()
  
  // 检查是否所有问题都已回答
  const unansweredQuestions = allAnswers.value.findIndex(answers => answers.length === 0)
  if (unansweredQuestions !== -1) {
    ElMessage.warning(`请回答第 ${unansweredQuestions + 1} 题`)
    jumpToQuestion(unansweredQuestions)
    return
  }

  try {
    isSubmitting.value = true
    
    // 格式化答案数据
    const formattedAnswers = allAnswers.value.map((answers, index) => ({
      question_id: questions.value[index].id,
      selected_options: answers
    }))

    await submitQuestionnaireAnswers(formattedAnswers)
    
    ElMessage.success('问诊提交成功')
    isCompleted.value = true
    
    // 3秒后跳转到治疗方案页面
    setTimeout(() => {
      router.push('/prescription')
    }, 3000)
    
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const viewResults = () => {
  router.push('/prescription')
}

const showExcellentSleepResult = () => {
  // 创建优秀睡眠质量的结果数据
  const excellentResult = {
    sleep_quality: {
      grade: '优',
      total_score: 96,
      max_possible_score: 96,
      percentage: 100
    },
    syndrome_diagnosis: {
      final_diagnosis: '睡眠质量优秀',
      primary_syndrome: '健康',
      secondary_syndrome: '良好',
      confidence: 1.0,
      dimension_analysis: {}
    },
    treatment_plan: {
      treatment_type: '保持',
      products: ['继续保持良好的睡眠习惯'],
      instructions: '恭喜！您的睡眠质量非常好，请继续保持良好的睡眠习惯和生活作息。',
      needs_professional: false
    },
    analysis_time: new Date().toISOString()
  }
  
  // 保存结果到本地存储
  localStorage.setItem('latestDiagnosis', JSON.stringify(excellentResult))
  localStorage.setItem('latestDiagnosisTime', new Date().toISOString())
  
  // 显示优秀结果页面
  showExcellentResult.value = true
  
  ElMessage.success('恭喜！您的睡眠质量非常好！')
  
  // 3秒后跳转到结果页面
  setTimeout(() => {
    router.push('/diagnosis')
  }, 3000)
}

// 根据选项内容长度动态计算最佳列宽
const getColSpan = (optionCount) => {
  if (!currentQuestion.value?.options) return 8
  
  // 计算最长选项的字符长度
  const maxLength = Math.max(...currentQuestion.value.options.map(opt => opt.label.length))
  
  // 特殊处理：检查是否有"4次及以上"这样的选项
  const hasComplexText = currentQuestion.value.options.some(opt => 
    opt.label.includes('次及以上') || opt.label.includes('以上') || opt.label.includes('以下')
  )
  
  // 根据内容特征决定布局
  if (maxLength >= 15) {
    // 非常长的选项（如药物名称）：每行2个
    return 12
  } else if (hasComplexText || maxLength >= 6) {
    // 包含复杂描述的选项：每行2个，给足空间
    return 12
  } else if (maxLength >= 3) {
    // 中等长度选项：每行3个
    return 8
  } else {
    // 短选项（如"是/否"）：每行4个
    return 6
  }
}

const getQuestionTypeColor = (category) => {
  const colorMap = {
    '睡眠质量': 'primary',
    '入睡时间': 'success',
    '睡眠时长': 'warning',
    '夜醒次数': 'danger',
    '中医症状': 'info',
    '精神状态': 'primary',
    '身体症状': 'warning'
  }
  return colorMap[category] || 'info'
}

// 生命周期
onMounted(() => {
  loadQuestions()
})
</script>

<style scoped>
.consultation {
  max-width: 1000px;
  margin: 0 auto;
}

.consultation-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header span {
  font-size: 18px;
  font-weight: bold;
  margin-left: 8px;
}

.progress-info {
  color: #909399;
  font-size: 14px;
}

.progress-bar {
  margin-bottom: 30px;
}

.question-section {
  min-height: 400px;
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.question-header h3 {
  margin: 0;
  color: #2c3e50;
  flex: 1;
  margin-right: 20px;
}

.options-section {
  margin-bottom: 50px;
  padding: 0 10px;
}

.radio-group,
.checkbox-group {
  width: 100%;
}

.option-col {
  margin-bottom: 28px;
  padding: 0 12px;
}

.radio-option,
.checkbox-option {
  width: 100%;
  padding: 18px 20px;
  margin: 16px 0;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  transition: all 0.3s;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  min-width: 140px;
  box-sizing: border-box;
  text-align: center;
}

.radio-option:hover,
.checkbox-option:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.radio-option.is-checked,
.checkbox-option.is-checked {
  border-color: #409eff;
  background: #f0f9ff;
}

/* 覆盖element-plus的默认样式 */
:deep(.el-radio) {
  width: 100%;
  margin: 0;
}

:deep(.el-checkbox) {
  width: 100%;
  margin: 0;
}

:deep(.el-radio__label),
:deep(.el-checkbox__label) {
  flex: 1;
  font-size: 15px;
  line-height: 1.6;
  color: #303133;
  padding: 0 10px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
}

.loading-section {
  padding: 40px;
}

.completed-section {
  padding: 20px;
}

.answer-summary {
  margin-bottom: 20px;
}

.summary-header {
  display: flex;
  align-items: center;
}

.summary-header span {
  margin-left: 8px;
  font-weight: bold;
}

.answer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.answer-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
}

.answer-item:hover {
  border-color: #409eff;
}

.answer-item.answered {
  background: #67c23a;
  border-color: #67c23a;
  color: white;
}

.answer-item.current {
  border-color: #409eff;
  background: #409eff;
  color: white;
}

@media (max-width: 768px) {
  .option-col {
    /* 移动端单列显示 */
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .option-col {
    /* 平板端2列显示 */
  }
}

/* 优秀睡眠质量结果样式 */
.excellent-result-section {
  padding: 40px 20px;
}

.excellent-result {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  padding: 40px;
}

.excellent-content {
  text-align: center;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.score-number {
  font-size: 36px;
  font-weight: bold;
  color: #FFD700;
}

.score-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.grade-badge {
  background: #FFD700;
  color: #333;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 18px;
}

.congratulations-text {
  margin: 30px 0;
  line-height: 1.8;
}

.congratulations-text p {
  font-size: 16px;
  margin: 10px 0;
  color: rgba(255, 255, 255, 0.9);
}

.excellent-result :deep(.el-result__title) {
  color: white !important;
  font-size: 28px !important;
}

.excellent-result :deep(.el-result__subtitle) {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 18px !important;
}
</style>