<template>
  <div class="checkout">
    <div class="container">
      <h1 class="page-title">
        <el-icon><CreditCard /></el-icon>
        确认订单
      </h1>

      <div v-if="!checkoutData" class="empty-checkout">
        <el-empty description="没有待结算的商品">
          <el-button type="primary" @click="goToCart">
            返回购物车
          </el-button>
        </el-empty>
      </div>

      <div v-else class="checkout-content">
        <!-- 收货地址 -->
        <el-card class="address-section" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </div>
          </template>
          
          <div v-if="selectedAddress" class="address-item selected">
            <div class="address-info">
              <div class="recipient">
                <span class="name">{{ selectedAddress.name }}</span>
                <span class="phone">{{ selectedAddress.phone }}</span>
                <el-tag v-if="selectedAddress.isDefault" type="primary" size="small">默认</el-tag>
              </div>
              <div class="address">{{ selectedAddress.fullAddress }}</div>
            </div>
            <el-button type="primary" text @click="showAddressDialog = true">
              更换地址
            </el-button>
          </div>
          
          <div v-else class="no-address">
            <p>请添加收货地址</p>
            <el-button type="primary" @click="showAddressDialog = true">
              添加地址
            </el-button>
          </div>
        </el-card>

        <!-- 商品清单 -->
        <el-card class="products-section" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Box /></el-icon>
              <span>商品清单</span>
            </div>
          </template>
          
          <div class="product-item" v-for="item in checkoutData.items" :key="item.id">
            <div class="product-image">
              <img :src="item.images?.[0] || '/images/default-product.png'" :alt="item.name" />
            </div>
            <div class="product-info">
              <h4>{{ item.name }}</h4>
              <p>{{ item.description }}</p>
              <div class="product-specs">
                <span>规格：{{ item.specifications }}</span>
              </div>
            </div>
            <div class="product-price">
              <span class="price">¥{{ item.price }}</span>
              <span class="quantity">x{{ item.quantity }}</span>
            </div>
            <div class="product-total">
              ¥{{ (item.price * item.quantity).toFixed(2) }}
            </div>
          </div>
        </el-card>

        <!-- 支付方式 -->
        <el-card class="payment-section" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Wallet /></el-icon>
              <span>支付方式</span>
            </div>
          </template>
          
          <el-radio-group v-model="selectedPayment" class="payment-options">
            <el-radio label="wechat" class="payment-option">
              <div class="payment-method">
                <div class="payment-icon">💳</div>
                <div class="payment-info">
                  <div class="payment-name">微信支付</div>
                  <div class="payment-desc">安全快捷的移动支付</div>
                </div>
              </div>
            </el-radio>
            
            <el-radio label="alipay" class="payment-option">
              <div class="payment-method">
                <div class="payment-icon">💰</div>
                <div class="payment-info">
                  <div class="payment-name">支付宝</div>
                  <div class="payment-desc">方便安全，秒速到账</div>
                </div>
              </div>
            </el-radio>
            
            <el-radio label="unionpay" class="payment-option">
              <div class="payment-method">
                <div class="payment-icon">🏦</div>
                <div class="payment-info">
                  <div class="payment-name">银行卡支付</div>
                  <div class="payment-desc">支持各大银行储蓄卡</div>
                </div>
              </div>
            </el-radio>
          </el-radio-group>
        </el-card>

        <!-- 订单摘要 -->
        <el-card class="summary-section" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>订单摘要</span>
            </div>
          </template>
          
          <div class="order-summary">
            <div class="summary-item">
              <span>商品总价：</span>
              <span>¥{{ checkoutData.subtotal.toFixed(2) }}</span>
            </div>
            
            <div v-if="checkoutData.comboDiscount > 0" class="summary-item discount">
              <span>组合优惠：</span>
              <span>-¥{{ checkoutData.comboDiscount.toFixed(2) }}</span>
            </div>
            
            <div class="summary-item">
              <span>运费：</span>
              <span v-if="checkoutData.finalTotal >= 99">免运费</span>
              <span v-else>¥10.00</span>
            </div>
            
            <el-divider />
            
            <div class="summary-item total">
              <span>实付金额：</span>
              <span class="total-amount">¥{{ getFinalAmount().toFixed(2) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 提交订单 -->
        <div class="submit-section">
          <el-button 
            type="primary" 
            size="large" 
            @click="submitOrder"
            :loading="submitting"
            class="submit-btn"
          >
            {{ submitting ? '提交中...' : `确认订单信息` }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 地址选择对话框 -->
    <el-dialog v-model="showAddressDialog" title="选择收货地址" width="500px">
      <div class="address-list">
        <div 
          v-for="address in addresses" 
          :key="address.id"
          class="address-option"
          :class="{ selected: address.id === selectedAddress?.id }"
          @click="selectAddress(address)"
        >
          <div class="address-content">
            <div class="recipient">
              <span class="name">{{ address.name }}</span>
              <span class="phone">{{ address.phone }}</span>
              <el-tag v-if="address.isDefault" type="primary" size="small">默认</el-tag>
            </div>
            <div class="address">{{ address.fullAddress }}</div>
          </div>
          <el-radio :label="address.id" v-model="selectedAddressId" />
        </div>
      </div>
      
      <div class="address-actions">
        <el-button @click="showAddAddressDialog = true">
          <el-icon><Plus /></el-icon>
          添加新地址
        </el-button>
      </div>
    </el-dialog>

    <!-- 添加地址对话框 -->
    <el-dialog v-model="showAddAddressDialog" title="添加收货地址" width="400px">
      <el-form :model="newAddress" label-width="80px">
        <el-form-item label="姓名" required>
          <el-input v-model="newAddress.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" required>
          <el-input v-model="newAddress.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="地址" required>
          <el-input 
            v-model="newAddress.address" 
            type="textarea" 
            placeholder="请输入详细地址"
            rows="3"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="newAddress.isDefault">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="addAddress">确定</el-button>
      </template>
    </el-dialog>

    <!-- 二维码支付对话框 -->
    <el-dialog 
      v-model="showPaymentDialog" 
      title="扫码支付" 
      width="400px"
      :show-close="false"
      :close-on-click-modal="false"
      center
    >
      <div class="payment-dialog">
        <div class="payment-header">
          <div class="payment-amount">
            ¥{{ getFinalAmount()?.toFixed(2) }}
          </div>
          <div class="payment-method-name">
            {{ getPaymentMethodName() }}
          </div>
        </div>
        
        <div class="qr-code-section">
          <div class="qr-code-container">
            <div v-if="paymentStatus === 'waiting'" class="qr-code">
              <div class="qr-placeholder">
                {{ generatePaymentQR() }}
              </div>
            </div>
            <div v-else-if="paymentStatus === 'success'" class="payment-success">
              <el-icon size="60" color="#67c23a"><CircleCheck /></el-icon>
              <p>支付成功</p>
            </div>
            <div v-else-if="paymentStatus === 'expired'" class="payment-expired">
              <el-icon size="60" color="#f56c6c"><CircleClose /></el-icon>
              <p>二维码已过期</p>
              <el-button type="primary" @click="regenerateQR">重新生成</el-button>
            </div>
          </div>
          
          <div v-if="paymentStatus === 'waiting'" class="payment-tips">
            <p>请使用{{ getPaymentMethodName() }}扫描二维码完成支付</p>
            <p class="countdown">{{ formatCountdown }}</p>
          </div>
        </div>
        
        <div class="payment-actions">
          <el-button v-if="paymentStatus === 'waiting'" @click="cancelPayment">
            取消支付
          </el-button>
          <el-button v-else-if="paymentStatus === 'success'" type="primary" @click="confirmSuccess" :loading="submitting">
            {{ submitting ? '处理中...' : '确认' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CreditCard, Location, Box, Wallet, Document, Plus, CircleCheck, CircleClose } from '@element-plus/icons-vue'

const router = useRouter()

// 数据
const checkoutData = ref(null)
const selectedPayment = ref('wechat')
const submitting = ref(false)
const showAddressDialog = ref(false)
const showAddAddressDialog = ref(false)
const selectedAddressId = ref(null)

// 二维码支付相关
const showPaymentDialog = ref(false)
const paymentStatus = ref('waiting') // waiting, success, expired
const paymentCountdown = ref(300) // 5分钟倒计时
const paymentTimer = ref(null)
const paymentCheckTimer = ref(null)

// 地址数据
const addresses = ref([
  {
    id: 1,
    name: '张三',
    phone: '138****8888',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '三里屯街道工体北路8号院',
    fullAddress: '北京市北京市朝阳区三里屯街道工体北路8号院',
    isDefault: true
  }
])

const newAddress = ref({
  name: '',
  phone: '',
  address: '',
  isDefault: false
})

// 计算选中的地址
const selectedAddress = computed(() => {
  return addresses.value.find(addr => addr.id === selectedAddressId.value) || 
         addresses.value.find(addr => addr.isDefault)
})

// 计算倒计时显示
const formatCountdown = computed(() => {
  const minutes = Math.floor(paymentCountdown.value / 60)
  const seconds = paymentCountdown.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 计算最终应付金额（包含运费）
const getFinalAmount = () => {
  if (!checkoutData.value) return 0
  
  const discountedTotal = checkoutData.value.finalTotal
  const shipping = discountedTotal >= 99 ? 0 : 10
  
  return discountedTotal + shipping
}

// 选择地址
const selectAddress = (address) => {
  selectedAddressId.value = address.id
  showAddressDialog.value = false
}

// 添加地址
const addAddress = () => {
  if (!newAddress.value.name || !newAddress.value.phone || !newAddress.value.address) {
    ElMessage.error('请填写完整的地址信息')
    return
  }
  
  const newAddr = {
    id: Date.now(),
    name: newAddress.value.name,
    phone: newAddress.value.phone,
    fullAddress: newAddress.value.address,
    isDefault: newAddress.value.isDefault
  }
  
  // 如果设为默认，取消其他默认地址
  if (newAddr.isDefault) {
    addresses.value.forEach(addr => addr.isDefault = false)
  }
  
  addresses.value.push(newAddr)
  selectedAddressId.value = newAddr.id
  
  // 重置表单
  newAddress.value = {
    name: '',
    phone: '',
    address: '',
    isDefault: false
  }
  
  showAddAddressDialog.value = false
  ElMessage.success('地址添加成功')
}

// 提交订单（现在只是确认信息，实际支付在二维码对话框中）
const submitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.error('请选择收货地址')
    return
  }
  
  submitting.value = true
  
  try {
    // 模拟订单信息验证
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 显示二维码支付对话框
    showPaymentDialog.value = true
    paymentStatus.value = 'waiting'
    paymentCountdown.value = 300
    
    // 启动倒计时
    startPaymentCountdown()
    
    // 启动支付状态检查（模拟）
    startPaymentStatusCheck()
    
  } catch (error) {
    ElMessage.error('订单信息验证失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 获取支付方式名称
const getPaymentMethodName = () => {
  const methods = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'unionpay': '银联支付'
  }
  return methods[selectedPayment.value] || '微信支付'
}

// 生成二维码（这里用文本模拟，实际应用中会生成真正的二维码）
const generatePaymentQR = () => {
  const qrContent = {
    paymentMethod: selectedPayment.value,
    amount: checkoutData.value?.finalTotal,
    orderId: 'ORDER_' + Date.now(),
    timestamp: Date.now()
  }
  
  // 这里模拟二维码显示，实际项目中会使用qrcode.js等库生成真正的二维码
  return `
    ████ ▄▄▄▄▄ █▀█ █▄█▀▀▀▄▄▄ █▄▄▄▄▄ ████
    ████ █   █ █▀▀▀█ ██▄▀██▀█ █   █ ████
    ████ █▄▄▄█ █▀ █▄▄▄▀██▄▄▀█ █▄▄▄█ ████
    ████▄▄▄▄▄▄▄█ ▀ █ █ █ █ █ █▄▄▄▄▄▄████
    ████▀▀▀▀▀▄▄▄▄▄▄▀▀██▄▄█▄▀▄▀▀▀▀▀▀▀████
    ████ ▄ ▄▄▄ ▄█▄█▀▄▄██▀▄█▄█ ▄ ▄▄▄ ████
    
    扫码支付 ¥${getFinalAmount()?.toFixed(2)}
    `
}

// 开始支付倒计时
const startPaymentCountdown = () => {
  if (paymentTimer.value) {
    clearInterval(paymentTimer.value)
  }
  
  paymentTimer.value = setInterval(() => {
    if (paymentCountdown.value > 0) {
      paymentCountdown.value--
    } else {
      // 倒计时结束，二维码过期
      paymentStatus.value = 'expired'
      clearInterval(paymentTimer.value)
      clearInterval(paymentCheckTimer.value)
    }
  }, 1000)
}

// 模拟支付状态检查
const startPaymentStatusCheck = () => {
  if (paymentCheckTimer.value) {
    clearInterval(paymentCheckTimer.value)
  }
  
  // 模拟10-30秒后支付成功
  const successDelay = 10000 + Math.random() * 20000
  
  setTimeout(() => {
    if (paymentStatus.value === 'waiting') {
      paymentStatus.value = 'success'
      clearInterval(paymentTimer.value)
      clearInterval(paymentCheckTimer.value)
      ElMessage.success('支付成功！')
    }
  }, successDelay)
}

// 重新生成二维码
const regenerateQR = () => {
  paymentStatus.value = 'waiting'
  paymentCountdown.value = 300
  startPaymentCountdown()
  startPaymentStatusCheck()
}

// 取消支付
const cancelPayment = () => {
  clearInterval(paymentTimer.value)
  clearInterval(paymentCheckTimer.value)
  showPaymentDialog.value = false
  paymentStatus.value = 'waiting'
}

// 确认支付成功
const confirmSuccess = async () => {
  try {
    submitting.value = true // 添加加载状态
    
    // 创建订单数据
    const finalAmount = getFinalAmount()
    const shipping = checkoutData.value.finalTotal >= 99 ? 0 : 10
    
    const orderData = {
      id: 'ORDER_' + Date.now(),
      items: checkoutData.value.items,
      address: selectedAddress.value,
      payment: selectedPayment.value,
      subtotal: checkoutData.value.subtotal,
      discount: checkoutData.value.comboDiscount,
      shipping: shipping,
      total: finalAmount,
      status: 'paid',
      createTime: new Date().toISOString()
    }
    
    // 保存订单到localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    orders.push(orderData)
    localStorage.setItem('orders', JSON.stringify(orders))
    
    // 清空购物车和结算数据
    localStorage.removeItem('cart')
    localStorage.removeItem('checkoutData')
    localStorage.removeItem('comboOffer')
    
    // 关闭支付对话框
    showPaymentDialog.value = false
    paymentStatus.value = 'waiting' // 重置状态
    
    // 清理定时器
    clearInterval(paymentTimer.value)
    clearInterval(paymentCheckTimer.value)
    
    ElMessage.success('订单创建成功！')
    
    // 延迟跳转，确保对话框完全关闭
    setTimeout(() => {
      router.push(`/order-success?orderId=${orderData.id}`)
    }, 500)
    
  } catch (error) {
    ElMessage.error('订单处理失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 返回购物车
const goToCart = () => {
  router.push('/cart')
}

// 加载结算数据
const loadCheckoutData = () => {
  try {
    const data = localStorage.getItem('checkoutData')
    if (data) {
      checkoutData.value = JSON.parse(data)
    }
  } catch (error) {
    console.warn('加载结算数据失败:', error)
  }
}

onMounted(() => {
  loadCheckoutData()
  
  // 设置默认选中地址
  const defaultAddress = addresses.value.find(addr => addr.isDefault)
  if (defaultAddress) {
    selectedAddressId.value = defaultAddress.id
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (paymentTimer.value) {
    clearInterval(paymentTimer.value)
  }
  if (paymentCheckTimer.value) {
    clearInterval(paymentCheckTimer.value)
  }
})
</script>

<style scoped>
.checkout {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.empty-checkout {
  text-align: center;
  margin: 50px 0;
}

.checkout-content > .el-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

/* 地址样式 */
.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #f8f9fa;
}

.address-info .recipient {
  margin-bottom: 8px;
}

.address-info .name {
  font-weight: bold;
  margin-right: 15px;
}

.address-info .phone {
  color: #666;
  margin-right: 10px;
}

.address-info .address {
  color: #666;
  font-size: 14px;
}

.no-address {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

/* 商品样式 */
.product-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 15px;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.product-info p {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.product-specs {
  font-size: 12px;
  color: #999;
}

.product-price {
  text-align: center;
  width: 100px;
}

.product-price .price {
  display: block;
  font-weight: bold;
  color: #e74c3c;
}

.product-price .quantity {
  font-size: 14px;
  color: #666;
}

.product-total {
  width: 100px;
  text-align: center;
  font-weight: bold;
  color: #e74c3c;
  font-size: 18px;
}

/* 支付方式样式 */
.payment-options {
  width: 100%;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-option:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.payment-icon {
  font-size: 24px;
}

.payment-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.payment-desc {
  color: #666;
  font-size: 14px;
}

/* 订单摘要样式 */
.order-summary {
  padding: 10px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-item.discount {
  color: #27ae60;
}

.summary-item.total {
  font-size: 18px;
  font-weight: bold;
}

.total-amount {
  color: #e74c3c;
  font-size: 24px;
}

/* 提交按钮 */
.submit-section {
  text-align: center;
  margin: 30px 0;
}

.submit-btn {
  width: 100%;
  max-width: 400px;
  height: 50px;
  font-size: 18px;
  font-weight: bold;
}

/* 地址对话框样式 */
.address-list {
  max-height: 300px;
  overflow-y: auto;
}

.address-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.address-option:hover {
  border-color: #409eff;
}

.address-option.selected {
  border-color: #409eff;
  background: #f0f9ff;
}

.address-actions {
  text-align: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

/* 二维码支付对话框样式 */
.payment-dialog {
  text-align: center;
}

.payment-header {
  margin-bottom: 20px;
}

.payment-amount {
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 5px;
}

.payment-method-name {
  color: #666;
  font-size: 14px;
}

.qr-code-section {
  margin: 20px 0;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.qr-code {
  width: 200px;
  height: 200px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.qr-placeholder {
  font-family: monospace;
  font-size: 8px;
  line-height: 1;
  color: #333;
  white-space: pre;
  text-align: center;
  padding: 10px;
}

.payment-success,
.payment-expired {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  background: #f8f9fa;
}

.payment-success p,
.payment-expired p {
  margin: 10px 0 0;
  font-weight: 500;
}

.payment-tips {
  color: #666;
  font-size: 14px;
}

.payment-tips p {
  margin: 5px 0;
}

.countdown {
  font-weight: bold;
  color: #e74c3c;
  font-size: 16px;
}

.payment-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

@media (max-width: 768px) {
  .product-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .product-price,
  .product-total {
    width: 100%;
    text-align: left;
  }
  
  .payment-method {
    gap: 10px;
  }
  
  .qr-code,
  .payment-success,
  .payment-expired {
    width: 160px;
    height: 160px;
  }
  
  .qr-placeholder {
    font-size: 6px;
  }
}
</style>