<template>
  <div class="diagnosis">
    <el-card class="diagnosis-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><TrendCharts /></el-icon>
          <span>健康评估报告</span>
        </div>
      </template>

      <div v-if="!hasResult" class="no-result">
        <el-result
          icon="warning"
          title="暂无评估报告"
          sub-title="请先完成健康评估"
        >
          <template #extra>
            <el-button type="primary" @click="goToConsultation">
              开始评估
              <el-icon><Right /></el-icon>
            </el-button>
          </template>
        </el-result>
      </div>

      <div v-else class="result-content">
        <el-steps :active="3" finish-status="success" align-center class="result-steps">
          <el-step title="健康评估" description="已完成18项问题" />
          <el-step title="数据分析" description="体质分析系统分析" />
          <el-step title="体质类型" description="确定最终体质类型" />
          <el-step title="健康建议" description="生成个性化建议" />
        </el-steps>

        <!-- 睡眠质量评估 -->
        <div class="sleep-quality-section">
          <h2>😴 睡眠质量评估</h2>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-card class="score-card" shadow="never">
                <div class="score-display">
                  <div class="score-number">{{ displayData?.sleepScore || 0 }}</div>
                  <div class="score-total">/ {{ displayData?.maxScore || 96 }}分</div>
                </div>
                <el-tag 
                  :type="getSleepGradeType(displayData?.sleepGrade)" 
                  size="large" 
                  class="grade-tag"
                >
                  {{ displayData?.sleepGrade || '未评估' }}
                </el-tag>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-progress 
                type="dashboard" 
                :percentage="displayData?.scorePercentage || 0" 
                :color="getScoreColor(displayData?.sleepScore || 0)"
                :width="120"
              >
                <template #default>
                  <span class="percentage-text">{{ displayData?.scorePercentage || 0 }}%</span>
                </template>
              </el-progress>
            </el-col>
          </el-row>
        </div>

        <!-- 体质分析结果 -->
        <div class="diagnosis-result">
          <h2>🔍 体质类型参考分析</h2>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="体质类型">
              <el-tag type="primary" size="large">{{ displayData?.syndromeDiagnosis }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="匹配度">
              <el-progress :percentage="(displayData?.confidence || 0) * 100" :color="getConfidenceColor(displayData?.confidence || 0)" />
            </el-descriptions-item>
            <el-descriptions-item label="主要特征">
              <el-tag type="success">{{ displayData?.primarySyndrome }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="次要特征">
              <el-tag type="info">{{ displayData?.secondarySyndrome }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          
          <!-- 二元诊断详情 -->
          <div v-if="displayData?.binaryDiagnosis" class="binary-diagnosis-info">
            <h4>🔬 二元诊断详情</h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="diagnosis-dimension">
                  <span class="dimension-label">行维度：</span>
                  <el-tag type="primary">{{ displayData.binaryDiagnosis.rowDimension }}</el-tag>
                  <span class="score-info">(得分: {{ displayData.binaryDiagnosis.rowScore }})</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="diagnosis-dimension">
                  <span class="dimension-label">列维度：</span>
                  <el-tag type="success">{{ displayData.binaryDiagnosis.columnDimension }}</el-tag>
                  <span class="score-info">(得分: {{ displayData.binaryDiagnosis.columnScore }})</span>
                </div>
              </el-col>
            </el-row>
            <div class="matrix-result">
              <el-icon><Connection /></el-icon>
              <span>{{ displayData.binaryDiagnosis.rowDimension }} × {{ displayData.binaryDiagnosis.columnDimension }} = {{ displayData?.syndromeDiagnosis }}</span>
            </div>
          </div>
          
          <!-- 维度分析 -->
          <div v-if="displayData?.dimensions" class="dimension-analysis">
            <h4>各维度得分分析</h4>
            <el-row :gutter="15">
              <el-col :xs="8" :sm="4" v-for="(score, dimension) in displayData.dimensions" :key="dimension">
                <div class="dimension-item">
                  <div class="dimension-name">{{ dimension }}</div>
                  <el-progress 
                    type="circle" 
                    :percentage="Math.abs(score) / 16 * 100" 
                    :width="60"
                    :color="score >= 0 ? '#67c23a' : '#f56c6c'"
                  >
                    <template #default>
                      <span :class="{ 'negative-score': score < 0 }">{{ score }}</span>
                    </template>
                  </el-progress>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 健康建议预览 -->
        <div class="treatment-preview">
          <h3>💊 个性化调理建议</h3>
          
          <el-alert 
            v-if="displayData?.needsProfessional"
            title="建议咨询专业健康管理师"
            type="warning"
            :closable="false"
            show-icon
            class="professional-alert"
          >
            根据您的症状评估结果，建议咨询专业健康管理师制定详细调理方案。
          </el-alert>
          
          <div class="treatment-type-info">
            <el-tag type="primary" size="large">
              建议类型：{{ displayData?.treatmentType }}
            </el-tag>
          </div>
          
          <div v-if="displayData?.recommendedProducts?.length > 0" class="product-preview">
            <h4>推荐产品</h4>
            
            <!-- 组合优惠信息 -->
            <div v-if="displayData?.comboOffer" class="combo-offer">
              <el-alert type="success" :closable="false">
                <template #title>
                  🎁 组合优惠：立省 ¥{{ displayData.comboOffer.savings }} 元（{{ displayData.comboOffer.discount }}% OFF）
                </template>
                原价：¥{{ displayData.comboOffer.totalPrice }} | 优惠价：¥{{ displayData.comboOffer.comboPrice }}
              </el-alert>
            </div>

            <el-row :gutter="20">
              <el-col 
                :xs="24" :sm="12" :md="8" 
                v-for="product in displayData.recommendedProducts" 
                :key="product.id"
              >
                <el-card class="product-card" shadow="hover">
                  <div class="product-header">
                    <div class="product-icon">{{ getProductIcon(product.name) }}</div>
                    <div class="product-badge" v-if="product.sales > 200">
                      <el-tag type="danger" size="small">热销</el-tag>
                    </div>
                  </div>
                  
                  <h4>{{ product.name }}</h4>
                  <p class="product-description">{{ product.description }}</p>
                  
                  <div class="product-details">
                    <div class="product-price">
                      <span class="current-price">¥{{ product.price }}</span>
                      <span class="original-price" v-if="product.originalPrice > product.price">
                        ¥{{ product.originalPrice }}
                      </span>
                    </div>
                    
                    <div class="product-rating">
                      <span class="rating-text">{{ product.rating }}分</span>
                      <span class="sales-text">已售{{ product.sales }}件</span>
                    </div>
                  </div>

                  <div class="product-actions">
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="addToCart(product)"
                      :disabled="product.stock === 0"
                    >
                      {{ product.stock > 0 ? '加入购物车' : '暂时缺货' }}
                    </el-button>
                    <el-button 
                      size="small" 
                      @click="viewProductDetails(product)"
                    >
                      查看详情
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            
            <!-- 一键购买组合 -->
            <div v-if="displayData?.comboOffer" class="combo-purchase">
              <el-button 
                type="primary" 
                size="large" 
                @click="purchaseCombo"
                class="combo-buy-btn"
              >
                🛒 一键购买组合套餐 - 仅需 ¥{{ displayData.comboOffer.comboPrice }}
              </el-button>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <el-button size="large" @click="goToConsultation">
            <el-icon><Refresh /></el-icon>
            重新评估
          </el-button>
          <el-button type="success" size="large" @click="consultWithDoctor">
            <el-icon><ChatDotRound /></el-icon>
            咨询健康管理师
          </el-button>
          <el-button type="primary" size="large" @click="goToPrescription">
            查看完整调理建议
            <el-icon><Right /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { TrendCharts, Right, Refresh, ChatDotRound, Connection } from '@element-plus/icons-vue'
import { getRecommendedProducts, getComboPrice } from '../data/products.js'

const router = useRouter()

// 诊断结果数据
const diagnosisData = ref(null)

const hasResult = computed(() => {
  return diagnosisData.value !== null
})

// 从诊断数据中提取显示信息
const displayData = computed(() => {
  if (!diagnosisData.value) return null
  
  const data = diagnosisData.value
  return {
    // 睡眠质量信息
    sleepGrade: data.sleep_quality?.grade || '未评估',
    sleepScore: data.sleep_quality?.total_score || 0,
    maxScore: data.sleep_quality?.max_possible_score || 64,
    scorePercentage: data.sleep_quality ? Math.round((data.sleep_quality.total_score / data.sleep_quality.max_possible_score) * 100) : 0,
    
    // 证型诊断信息
    syndromeDiagnosis: data.syndrome_diagnosis?.final_diagnosis || '未确定证型',
    primarySyndrome: data.syndrome_diagnosis?.primary_syndrome || '未确定',
    secondarySyndrome: data.syndrome_diagnosis?.secondary_syndrome || '未确定',
    confidence: data.syndrome_diagnosis?.confidence || 0,
    
    // 维度分析（转换新格式为显示格式）
    dimensions: (() => {
      const dimensionAnalysis = data.syndrome_diagnosis?.dimension_analysis || {}
      const displayDimensions = {}
      
      // 将新格式 {维度名: {total_score: 分数}} 转换为 {维度名: 分数}
      Object.keys(dimensionAnalysis).forEach(dimensionName => {
        const dimensionData = dimensionAnalysis[dimensionName]
        displayDimensions[dimensionName] = dimensionData?.total_score || 0
      })
      
      return displayDimensions
    })(),
    
    // 二元诊断信息
    binaryDiagnosis: data.syndrome_diagnosis?.binary_diagnosis ? {
      rowDimension: data.syndrome_diagnosis.binary_diagnosis.row_dimension,
      rowScore: data.syndrome_diagnosis.binary_diagnosis.row_score,
      columnDimension: data.syndrome_diagnosis.binary_diagnosis.column_dimension,
      columnScore: data.syndrome_diagnosis.binary_diagnosis.column_score,
      matrixKey: data.syndrome_diagnosis.binary_diagnosis.matrix_key
    } : null,
    
    // 治疗方案预览
    treatmentType: data.treatment_plan?.treatment_type || '未确定',
    products: data.treatment_plan?.products || [],
    needsProfessional: data.treatment_plan?.needs_professional || false,
    
    // 详细产品信息
    recommendedProducts: (() => {
      const diagnosis = data.syndrome_diagnosis?.final_diagnosis
      if (diagnosis) {
        return getRecommendedProducts(diagnosis)
      }
      return []
    })(),
    
    // 组合优惠信息
    comboOffer: (() => {
      const diagnosis = data.syndrome_diagnosis?.final_diagnosis
      if (diagnosis) {
        const products = getRecommendedProducts(diagnosis)
        return getComboPrice(products)
      }
      return null
    })()
  }
})

// 加载诊断数据
const loadDiagnosisData = async () => {
  try {
    const storedDiagnosis = localStorage.getItem('latestDiagnosis')
    if (storedDiagnosis) {
      diagnosisData.value = JSON.parse(storedDiagnosis)
      
      // 同时保存到数据库（如果还没保存过）
      const hasBeenSaved = localStorage.getItem('latestDiagnosisSaved')
      if (!hasBeenSaved) {
        const storedAnswers = localStorage.getItem('latestAnswers')
        if (storedAnswers) {
          const { saveDiagnosisResult } = await import('../api/consultation.js')
          const answers = JSON.parse(storedAnswers)
          const saveResult = await saveDiagnosisResult(answers, diagnosisData.value)
          if (saveResult.success) {
            localStorage.setItem('latestDiagnosisSaved', 'true')
            console.log('诊断结果已保存到数据库')
          }
        }
      }
    }
  } catch (error) {
    console.warn('加载或保存诊断数据失败:', error)
  }
}

// 获取睡眠等级类型颜色
const getSleepGradeType = (grade) => {
  switch(grade) {
    case '优': return 'success'
    case '良': return 'primary' 
    case '中': return 'warning'
    case '差': return 'danger'
    default: return 'info'
  }
}

// 获取分数颜色
const getScoreColor = (score) => {
  if (score >= 54) return '#67c23a' // 优
  if (score >= 34) return '#409eff' // 良
  if (score >= 0) return '#e6a23c'  // 中
  return '#f56c6c' // 差
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return '#67c23a'
  if (confidence >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

// 获取产品图标
const getProductIcon = (product) => {
  if (product.includes('茶包') || product.includes('茶')) return '🍵'
  if (product.includes('奶粉') || product.includes('蛋白')) return '🥛'
  if (product.includes('坚果')) return '🌰'
  if (product.includes('鱼油')) return '🐟'
  if (product.includes('穴位贴')) return '🎯'
  if (product.includes('健康顾问咨询')) return '👨‍⚕️'
  return '💊'
}

// 获取产品描述
const getProductDescription = (product) => {
  if (product.includes('舒肝解郁茶包')) return '疏肝解郁，宁心安神'
  if (product.includes('补血活血茶包')) return '补气养血，调和营卫'
  if (product.includes('安神定志茶包')) return '安神定志，宁心除烦'
  if (product.includes('通用安眠茶包')) return '温和安神，改善睡眠质量'
  if (product.includes('植物蛋白奶粉')) return '优质植物蛋白，补充营养'
  if (product.includes('坚果营养包')) return '补肾填精，强筋健骨'
  if (product.includes('鱼油胶囊')) return '补脑益智，增强记忆'
  if (product.includes('穴位贴')) return '外治内调，疗效显著'
  if (product.includes('健康顾问咨询')) return '专业健康管理服务'
  return '专业保健产品'
}

const goToConsultation = () => {
  router.push('/consultation')
}

const goToPrescription = () => {
  router.push('/prescription')
}

const consultWithDoctor = () => {
  router.push('/doctor-consultation')
}

// 购物车功能
const cart = ref([])

const addToCart = (product) => {
  // 检查购物车中是否已有该产品
  const existingItem = cart.value.find(item => item.id === product.id)
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.value.push({
      ...product,
      quantity: 1
    })
  }
  
  // 保存到localStorage
  localStorage.setItem('cart', JSON.stringify(cart.value))
  
  ElMessage({
    message: `已将 ${product.name} 加入购物车`,
    type: 'success',
    duration: 2000
  })
}

const viewProductDetails = (product) => {
  // 保存产品详情到localStorage，然后跳转到产品详情页
  localStorage.setItem('currentProduct', JSON.stringify(product))
  router.push(`/product/${product.id}`)
}

const purchaseCombo = () => {
  if (!displayData.value?.recommendedProducts) return
  
  // 将所有推荐产品加入购物车
  displayData.value.recommendedProducts.forEach(product => {
    const existingItem = cart.value.find(item => item.id === product.id)
    if (!existingItem) {
      cart.value.push({
        ...product,
        quantity: 1
      })
    }
  })
  
  // 标记为组合购买，享受优惠价格
  const comboInfo = displayData.value.comboOffer
  localStorage.setItem('cart', JSON.stringify(cart.value))
  localStorage.setItem('comboOffer', JSON.stringify(comboInfo))
  
  ElMessage({
    message: `组合套餐已加入购物车，享受优惠价 ¥${comboInfo.comboPrice}`,
    type: 'success',
    duration: 3000
  })
  
  // 跳转到购物车页面
  router.push('/cart')
}

// 页面加载时恢复购物车
const loadCart = () => {
  try {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      cart.value = JSON.parse(savedCart)
    }
  } catch (error) {
    console.warn('加载购物车失败:', error)
  }
}

onMounted(() => {
  loadDiagnosisData()
  loadCart()
})
</script>

<style scoped>
.diagnosis {
  max-width: 1000px;
  margin: 0 auto;
}

.diagnosis-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.card-header .el-icon {
  margin-right: 8px;
  font-size: 20px;
}

.no-result {
  padding: 40px;
}

.result-content {
  padding: 20px 0;
}

.result-steps {
  margin-bottom: 40px;
}

.diagnosis-result {
  margin-bottom: 40px;
}

.diagnosis-result h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.symptom-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

.treatment-preview {
  margin-bottom: 40px;
}

.treatment-preview h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.treatment-card {
  text-align: center;
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.treatment-card:hover {
  transform: translateY(-5px);
}

.treatment-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.treatment-card h4 {
  color: #2c3e50;
  margin: 10px 0;
}

.treatment-card p {
  color: #7f8c8d;
  line-height: 1.6;
}

/* 新的产品卡片样式 */
.product-card {
  text-align: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.product-header {
  position: relative;
  margin-bottom: 15px;
}

.product-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.product-badge {
  position: absolute;
  top: -5px;
  right: 10px;
}

.product-description {
  color: #666;
  font-size: 14px;
  margin: 10px 0;
  line-height: 1.4;
}

.product-details {
  margin: 15px 0;
}

.product-price {
  margin-bottom: 8px;
}

.current-price {
  color: #e74c3c;
  font-size: 18px;
  font-weight: bold;
}

.original-price {
  color: #bdc3c7;
  font-size: 14px;
  text-decoration: line-through;
  margin-left: 8px;
}

.product-rating {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #7f8c8d;
}

.rating-text {
  color: #f39c12;
}

.product-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 15px;
}

.combo-offer {
  margin: 20px 0;
}

.combo-purchase {
  text-align: center;
  margin: 30px 0;
}

.combo-buy-btn {
  width: 100%;
  max-width: 400px;
  height: 50px;
  font-size: 16px;
  font-weight: bold;
}

.action-buttons {
  text-align: center;
  padding: 20px 0;
}

.action-buttons .el-button {
  margin: 0 10px;
}

.sleep-quality-section {
  margin-bottom: 40px;
}

.sleep-quality-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.score-card {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.score-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 15px;
}

.score-number {
  font-size: 48px;
  font-weight: bold;
  line-height: 1;
}

.score-total {
  font-size: 18px;
  margin-left: 5px;
  opacity: 0.8;
}

.grade-tag {
  font-size: 16px;
  padding: 8px 16px;
}

.percentage-text {
  color: #606266;
  font-size: 14px;
  font-weight: bold;
}

.dimension-analysis {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.dimension-analysis h4 {
  color: #409eff;
  margin-bottom: 20px;
  text-align: center;
}

.dimension-item {
  text-align: center;
  margin-bottom: 20px;
}

.dimension-name {
  font-size: 12px;
  color: #606266;
  margin-bottom: 10px;
}

.negative-score {
  color: #f56c6c;
  font-weight: bold;
}

.professional-alert {
  margin-bottom: 20px;
}

.treatment-type-info {
  text-align: center;
  margin: 20px 0;
}

.product-preview h4 {
  color: #2c3e50;
  margin: 20px 0 15px 0;
  text-align: center;
}

/* 二元诊断详情样式 */
.binary-diagnosis-info {
  margin-top: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.binary-diagnosis-info h4 {
  color: #409eff;
  margin-bottom: 15px;
  font-size: 16px;
}

.diagnosis-dimension {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.dimension-label {
  font-weight: bold;
  color: #606266;
  margin-right: 8px;
  min-width: 70px;
}

.score-info {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.matrix-result {
  margin-top: 15px;
  padding: 12px;
  background: #e8f4fd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #409eff;
}

.matrix-result .el-icon {
  margin-right: 8px;
}
</style>