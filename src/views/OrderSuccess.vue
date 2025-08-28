<template>
  <div class="order-success">
    <div class="container">
      <div class="success-content">
        <div class="success-icon">
          <el-icon color="#67c23a" size="80px">
            <SuccessFilled />
          </el-icon>
        </div>
        
        <h1 class="success-title">订单提交成功！</h1>
        <p class="success-subtitle">感谢您的购买，我们将尽快为您发货</p>
        
        <div class="order-info">
          <div class="order-number">
            <span class="label">订单号：</span>
            <span class="value">{{ orderId }}</span>
          </div>
          
          <div class="payment-amount">
            <span class="label">支付金额：</span>
            <span class="amount">¥{{ orderTotal }}</span>
          </div>
        </div>
        
        <div class="next-steps">
          <h3>接下来您可以：</h3>
          
          <div class="action-cards">
            <el-card class="action-card" shadow="hover" @click="viewOrder">
              <div class="action-icon">📋</div>
              <h4>查看订单详情</h4>
              <p>跟踪您的订单状态和物流信息</p>
            </el-card>
            
            <el-card class="action-card" shadow="hover" @click="continueShopping">
              <div class="action-icon">🛍️</div>
              <h4>继续购物</h4>
              <p>浏览更多健康产品</p>
            </el-card>
            
            <el-card class="action-card" shadow="hover" @click="contactService">
              <div class="action-icon">💬</div>
              <h4>联系客服</h4>
              <p>如有问题，随时为您服务</p>
            </el-card>
          </div>
        </div>
        
        <div class="service-promise">
          <h3>🎁 服务承诺</h3>
          <div class="promise-items">
            <div class="promise-item">
              <el-icon><Van /></el-icon>
              <div>
                <strong>快速发货</strong>
                <p>24小时内发货，顺丰包邮</p>
              </div>
            </div>
            
            <div class="promise-item">
              <el-icon><SuccessFilled /></el-icon>
              <div>
                <strong>品质保证</strong>
                <p>正品保证，支持7天无理由退换</p>
              </div>
            </div>
            
            <div class="promise-item">
              <el-icon><SuccessFilled /></el-icon>
              <div>
                <strong>贴心服务</strong>
                <p>专业客服，随时为您解答</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="health-tips">
          <h3>💊 用药小贴士</h3>
          <el-alert 
            type="info" 
            :closable="false"
            show-icon
          >
            <div>
              <p><strong>服用建议：</strong></p>
              <ul>
                <li>请按照产品说明或医师指导服用</li>
                <li>保持良好的作息规律，配合产品效果更佳</li>
                <li>如有不适症状，请及时咨询专业医师</li>
                <li>产品为保健品，不能替代药品治疗</li>
              </ul>
            </div>
          </el-alert>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { SuccessFilled, Van } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const orderId = ref('')
const orderTotal = ref('0.00')

// 查看订单详情
const viewOrder = () => {
  // 这里可以跳转到订单详情页面
  ElMessage.info('订单详情功能开发中...')
}

// 继续购物
const continueShopping = () => {
  router.push('/diagnosis')
}

// 联系客服
const contactService = () => {
  router.push('/chat')
}

// 加载订单信息
const loadOrderInfo = () => {
  orderId.value = route.query.orderId || 'ORDER_' + Date.now()
  
  try {
    // 从localStorage获取订单信息
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const currentOrder = orders.find(order => order.id === orderId.value)
    
    if (currentOrder) {
      orderTotal.value = currentOrder.total.toFixed(2)
    } else {
      // 如果没有找到订单，从结算数据获取
      const checkoutData = localStorage.getItem('checkoutData')
      if (checkoutData) {
        const data = JSON.parse(checkoutData)
        orderTotal.value = data.finalTotal.toFixed(2)
      }
    }
  } catch (error) {
    console.warn('加载订单信息失败:', error)
  }
}

onMounted(() => {
  loadOrderInfo()
})
</script>

<style scoped>
.order-success {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 0;
  display: flex;
  align-items: center;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.success-content {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.success-icon {
  margin-bottom: 20px;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.success-title {
  color: #2c3e50;
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: bold;
}

.success-subtitle {
  color: #7f8c8d;
  font-size: 18px;
  margin-bottom: 40px;
}

.order-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-number .label,
.payment-amount .label {
  color: #666;
  font-size: 14px;
}

.order-number .value {
  font-family: monospace;
  font-weight: bold;
  color: #2c3e50;
}

.payment-amount .amount {
  color: #e74c3c;
  font-size: 24px;
  font-weight: bold;
}

.next-steps {
  margin-bottom: 40px;
}

.next-steps h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.action-card {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 20px;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.action-card h4 {
  color: #2c3e50;
  margin: 10px 0;
  font-size: 18px;
}

.action-card p {
  color: #7f8c8d;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.service-promise {
  background: #f0f9ff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
}

.service-promise h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.promise-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.promise-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.promise-item .el-icon {
  color: #409eff;
  font-size: 24px;
  flex-shrink: 0;
}

.promise-item strong {
  display: block;
  color: #2c3e50;
  margin-bottom: 5px;
}

.promise-item p {
  color: #666;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

.health-tips {
  text-align: left;
}

.health-tips h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  text-align: center;
}

.health-tips ul {
  margin: 10px 0;
  padding-left: 20px;
}

.health-tips li {
  color: #666;
  line-height: 1.6;
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .success-content {
    padding: 30px 20px;
  }
  
  .success-title {
    font-size: 24px;
  }
  
  .success-subtitle {
    font-size: 16px;
  }
  
  .order-info {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .action-cards {
    grid-template-columns: 1fr;
  }
  
  .promise-items {
    grid-template-columns: 1fr;
  }
}
</style>