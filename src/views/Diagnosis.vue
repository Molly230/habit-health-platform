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
        <!-- 评估结果 -->
        <div class="assessment-section">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-card class="assessment-card sleep-card" shadow="never">
                <div class="card-header">
                  <h3>😴 睡眠质量评估</h3>
                </div>
                <div class="card-content">
                  <!-- 等级显示 -->
                  <div class="grade-display">
                    <div class="grade-value" :class="'grade-' + (displayData?.sleepGrade || 'unknown')">
                      {{ displayData?.sleepGrade || '未评估' }}
                    </div>
                  </div>
                  
                  <!-- 评分显示 -->
                  <div class="score-display">
                    <div class="score-number">{{ displayData?.sleepScore || 0 }}</div>
                    <div class="score-total">/ {{ displayData?.maxScore || 96 }}分</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-card class="assessment-card syndrome-card" shadow="never">
                <div class="card-header">
                  <h3>🔍 体质类型分析</h3>
                </div>
                <div class="card-content">
                  <div class="syndrome-display">
                    <div class="syndrome-value">
                      {{ displayData?.syndromeDiagnosis || '未确定证型' }}
                    </div>
                    <div class="confidence-info">
                      匹配度：{{ Math.round((displayData?.confidence || 0) * 100) }}%
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 肝郁肾虚解释 -->
        <div class="syndrome-explanation">
          <h2>📋 {{ displayData?.syndromeDiagnosis || '体质类型' }}详解</h2>
          <el-card class="explanation-card" shadow="never">
            <div class="explanation-content">
              <div class="explanation-section">
                <h4>🔸 体质特点</h4>
                <p>肝郁肾虚是中医常见的体质类型，主要表现为肝气郁结、肾精不足。肝主疏泄，肾主藏精，两脏功能失调容易导致睡眠障碍、情绪波动等症状。</p>
              </div>
              
              <div class="explanation-section">
                <h4>🔸 主要症状</h4>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <ul class="symptom-list">
                      <li>入睡困难，多梦易醒</li>
                      <li>情绪烦躁，压力大</li>
                      <li>腰膝酸软，疲劳乏力</li>
                    </ul>
                  </el-col>
                  <el-col :span="12">
                    <ul class="symptom-list">
                      <li>记忆力下降，注意力不集中</li>
                      <li>夜尿频繁，手脚发凉</li>
                      <li>消化不良，胃胀腹胀</li>
                    </ul>
                  </el-col>
                </el-row>
              </div>
              
              <div class="explanation-section">
                <h4>🔸 调理建议</h4>
                <p>建议从疏肝解郁、补肾填精两方面入手。保持心情舒畅，规律作息，适度运动。</p>
              </div>
              
              <!-- 推荐产品和购物车 -->
              <div v-if="displayData?.recommendedProducts?.length > 0" class="explanation-section">
                <h4>🔸 推荐产品</h4>
                
                <el-row :gutter="20" class="product-shopping-section">
                  <!-- 左侧产品区域 (2/3) -->
                  <el-col :span="16">
                    <el-row :gutter="16">
                      <el-col 
                        :xs="24" :sm="12" :lg="8" 
                        v-for="product in displayData.recommendedProducts" 
                        :key="product.id"
                        class="product-col"
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
                              block
                            >
                              {{ product.stock > 0 ? '加入购物车' : '暂时缺货' }}
                            </el-button>
                          </div>
                        </el-card>
                      </el-col>
                    </el-row>
                  </el-col>
                  
                  <!-- 右侧购物车区域 (1/3) -->
                  <el-col :span="8">
                    <el-card class="cart-card" shadow="always">
                      <div class="cart-header">
                        <h4>🛒 购物车</h4>
                        <el-badge :value="cartItemCount" class="cart-badge">
                          <el-button size="small" @click="goToCart" text>
                            查看全部
                          </el-button>
                        </el-badge>
                      </div>
                      
                      <div class="cart-content">
                        <div v-if="cart.length === 0" class="empty-cart">
                          <el-empty :image-size="80" description="购物车空空如也">
                            <el-button type="primary" size="small" @click="addAllToCart">
                              一键添加推荐商品
                            </el-button>
                          </el-empty>
                        </div>
                        
                        <div v-else class="cart-items">
                          <div v-for="item in cart.slice(0, 3)" :key="item.id" class="cart-item">
                            <div class="item-info">
                              <div class="item-name">{{ item.name }}</div>
                              <div class="item-price">¥{{ item.price }} × {{ item.quantity }}</div>
                            </div>
                            <div class="item-actions">
                              <el-button size="small" @click="removeFromCart(item)" text type="danger">
                                删除
                              </el-button>
                            </div>
                          </div>
                          
                          <div v-if="cart.length > 3" class="more-items">
                            还有 {{ cart.length - 3 }} 个商品...
                          </div>
                        </div>
                      </div>
                      
                      <div class="cart-footer" v-if="cart.length > 0">
                        <!-- 优惠信息 -->
                        <div v-if="hasDiscount" class="discount-info">
                          <el-alert type="success" :closable="false" size="small">
                            <template #title>
                              🎉 2件以上享8.8折优惠
                            </template>
                          </el-alert>
                          <div class="price-breakdown">
                            <div class="original-price">原价：¥{{ originalTotalPrice }}</div>
                            <div class="discount-amount">优惠：-¥{{ discountAmount }}</div>
                          </div>
                        </div>
                        
                        <div class="total-price">
                          <span v-if="hasDiscount" class="discount-label">优惠后：</span>
                          ¥{{ totalPrice }}
                        </div>
                        <el-button type="primary" size="large" @click="goToCheckout" block>
                          立即结算 ({{ cartItemCount }})
                        </el-button>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-card>
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
  console.log('hasResult检查:', diagnosisData.value)
  // 检查是否有真实的localStorage数据
  const storedDiagnosis = localStorage.getItem('latestDiagnosis')
  return storedDiagnosis !== null && diagnosisData.value !== null && diagnosisData.value !== undefined
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
    console.log('存储的诊断数据:', storedDiagnosis) // 调试日志
    
    if (storedDiagnosis) {
      const parsedData = JSON.parse(storedDiagnosis)
      console.log('解析后的诊断数据:', parsedData) // 调试日志
      diagnosisData.value = parsedData
      
      // 同时保存到数据库（如果还没保存过）
      const hasBeenSaved = localStorage.getItem('latestDiagnosisSaved')
      if (!hasBeenSaved) {
        const storedAnswers = localStorage.getItem('latestAnswers')
        if (storedAnswers) {
          try {
            const { saveDiagnosisResult } = await import('../api/consultation.js')
            const answers = JSON.parse(storedAnswers)
            const saveResult = await saveDiagnosisResult(answers, diagnosisData.value)
            if (saveResult.success) {
              localStorage.setItem('latestDiagnosisSaved', 'true')
              console.log('诊断结果已保存到数据库')
            }
          } catch (saveError) {
            console.warn('保存到数据库失败，但不影响显示:', saveError)
          }
        }
      }
    } else {
      console.log('没有找到诊断数据')
      diagnosisData.value = null
    }
  } catch (error) {
    console.error('加载诊断数据失败:', error)
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

// 购物车计算属性
const cartItemCount = computed(() => {
  return cart.value.reduce((total, item) => total + item.quantity, 0)
})

const totalPrice = computed(() => {
  const originalTotal = cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  
  // 2个以上产品打8.8折
  if (cartItemCount.value >= 2) {
    return Math.round(originalTotal * 0.88)
  }
  
  return originalTotal
})

const originalTotalPrice = computed(() => {
  return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

const hasDiscount = computed(() => {
  return cartItemCount.value >= 2
})

const discountAmount = computed(() => {
  if (hasDiscount.value) {
    return originalTotalPrice.value - totalPrice.value
  }
  return 0
})

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

// 一键添加所有推荐商品
const addAllToCart = () => {
  if (!displayData.value?.recommendedProducts) return
  
  displayData.value.recommendedProducts.forEach(product => {
    const existingItem = cart.value.find(item => item.id === product.id)
    if (!existingItem) {
      cart.value.push({
        ...product,
        quantity: 1
      })
    }
  })
  
  localStorage.setItem('cart', JSON.stringify(cart.value))
  
  ElMessage({
    message: `已添加${displayData.value.recommendedProducts.length}个推荐商品到购物车`,
    type: 'success',
    duration: 2000
  })
}

// 从购物车移除商品
const removeFromCart = (item) => {
  const index = cart.value.findIndex(cartItem => cartItem.id === item.id)
  if (index > -1) {
    cart.value.splice(index, 1)
    localStorage.setItem('cart', JSON.stringify(cart.value))
    ElMessage({
      message: `已移除 ${item.name}`,
      type: 'info',
      duration: 1500
    })
  }
}

// 跳转到购物车页面
const goToCart = () => {
  router.push('/cart')
}

// 跳转到结算页面
const goToCheckout = () => {
  if (cart.value.length === 0) {
    ElMessage.warning('购物车为空')
    return
  }
  
  // 准备结算数据，包含折扣信息
  const checkoutData = {
    items: cart.value,
    subtotal: originalTotalPrice.value,
    comboDiscount: hasDiscount.value ? discountAmount.value : 0,
    finalTotal: totalPrice.value,
    shipping: totalPrice.value >= 99 ? 0 : 10
  }
  
  // 保存结算数据到localStorage
  localStorage.setItem('checkoutData', JSON.stringify(checkoutData))
  
  router.push('/checkout')
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

onMounted(async () => {
  console.log('诊断页面加载中...')
  await loadDiagnosisData()
  loadCart()
  console.log('诊断页面加载完成, diagnosisData:', diagnosisData.value)
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

.assessment-section {
  margin-bottom: 40px;
}

.assessment-card {
  height: 220px;
  background: linear-gradient(135deg, #409EFF 0%, #6bb6ff 100%);
  color: white;
  border-radius: 12px;
  border: none;
}

.card-header {
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.card-content {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 20px;
}

.grade-display {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grade-label {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 8px;
}

.grade-value {
  font-size: 32px;
  font-weight: bold;
  padding: 12px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  line-height: 1;
}

.grade-value.grade-优 {
  background: rgba(103, 194, 58, 0.3);
  border: 2px solid #67c23a;
}

.grade-value.grade-良 {
  background: rgba(64, 158, 255, 0.3);
  border: 2px solid #409eff;
}

.grade-value.grade-中 {
  background: rgba(230, 162, 60, 0.3);
  border: 2px solid #e6a23c;
}

.grade-value.grade-差 {
  background: rgba(245, 108, 108, 0.3);
  border: 2px solid #f56c6c;
}

.score-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 5px;
}

.score-number {
  font-size: 64px;
  font-weight: bold;
  line-height: 1;
}

.score-total {
  font-size: 24px;
  margin-left: 8px;
  opacity: 0.8;
}

.grade-tag {
  font-size: 16px;
  padding: 8px 16px;
}

.syndrome-display {
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.syndrome-value {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 15px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  line-height: 1;
}

.confidence-info {
  font-size: 14px;
  opacity: 0.9;
}

/* 肝郁肾虚解释样式 */
.syndrome-explanation {
  margin-bottom: 40px;
}

.syndrome-explanation h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.explanation-card {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.explanation-content {
  padding: 20px;
}

.explanation-section {
  margin-bottom: 25px;
}

.explanation-section h4 {
  color: #409EFF;
  margin-bottom: 12px;
  font-size: 16px;
}

.explanation-section p {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 0;
}

.symptom-list {
  margin: 0;
  padding-left: 20px;
}

.symptom-list li {
  color: #606266;
  line-height: 1.8;
  margin-bottom: 5px;
}

.lifestyle-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

/* 产品购物车布局 */
.product-shopping-section {
  margin-top: 20px;
}

.product-col {
  margin-bottom: 16px;
}

.product-card {
  height: 100%;
}

.product-actions .el-button {
  margin: 0;
}

/* 购物车样式 */
.cart-card {
  position: sticky;
  top: 20px;
  height: fit-content;
  min-height: 400px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.cart-header h4 {
  margin: 0;
  color: #2c3e50;
}

.cart-badge {
  margin-right: 8px;
}

.cart-content {
  min-height: 250px;
}

.empty-cart {
  text-align: center;
  padding: 20px 0;
}

.cart-items {
  max-height: 300px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 4px;
  font-weight: 500;
}

.item-price {
  font-size: 12px;
  color: #e74c3c;
  font-weight: bold;
}

.item-actions {
  margin-left: 8px;
}

.more-items {
  text-align: center;
  color: #909399;
  font-size: 12px;
  padding: 8px 0;
}

.cart-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.total-price {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 12px;
}

/* 折扣信息样式 */
.discount-info {
  margin-bottom: 12px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 6px;
  border-left: 3px solid #67c23a;
  text-align: left;
}

.price-breakdown {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
  margin-top: 8px;
  padding: 4px 0;
  border-top: 1px solid #e4e7ed;
}

.discount-label {
  color: #67c23a;
  font-weight: 500;
  font-size: 13px;
}

.original-price-text {
  text-decoration: line-through;
  color: #909399;
}

.discount-amount {
  color: #f56c6c;
  font-weight: 500;
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