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
              <span v-if="checkoutData.subtotal >= 99">免运费</span>
              <span v-else>¥10.00</span>
            </div>
            
            <el-divider />
            
            <div class="summary-item total">
              <span>实付金额：</span>
              <span class="total-amount">¥{{ checkoutData.finalTotal.toFixed(2) }}</span>
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
            {{ submitting ? '提交中...' : `立即支付 ¥${checkoutData.finalTotal.toFixed(2)}` }}
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CreditCard, Location, Box, Wallet, Document, Plus } from '@element-plus/icons-vue'

const router = useRouter()

// 数据
const checkoutData = ref(null)
const selectedPayment = ref('wechat')
const submitting = ref(false)
const showAddressDialog = ref(false)
const showAddAddressDialog = ref(false)
const selectedAddressId = ref(null)

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

// 提交订单
const submitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.error('请选择收货地址')
    return
  }
  
  submitting.value = true
  
  try {
    // 模拟订单提交
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 创建订单数据
    const orderData = {
      id: 'ORDER_' + Date.now(),
      items: checkoutData.value.items,
      address: selectedAddress.value,
      payment: selectedPayment.value,
      subtotal: checkoutData.value.subtotal,
      discount: checkoutData.value.comboDiscount,
      total: checkoutData.value.finalTotal,
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
    
    ElMessage.success('订单提交成功！')
    
    // 跳转到订单成功页面
    router.push(`/order-success?orderId=${orderData.id}`)
    
  } catch (error) {
    ElMessage.error('订单提交失败，请重试')
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
}
</style>