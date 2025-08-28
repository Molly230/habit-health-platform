<template>
  <div class="cart">
    <div class="container">
      <h1 class="page-title">
        <el-icon><ShoppingCart /></el-icon>
        购物车
      </h1>

      <div v-if="cartItems.length === 0" class="empty-cart">
        <el-empty description="购物车空空如也">
          <el-button type="primary" @click="goToHome">
            去看看产品
          </el-button>
        </el-empty>
      </div>

      <div v-else class="cart-content">
        <!-- 组合优惠信息 -->
        <div v-if="comboOffer" class="combo-info">
          <el-alert type="success" :closable="false">
            <template #title>
              🎁 您享受组合优惠：立省 ¥{{ comboOffer.savings }} 元
            </template>
            <div class="combo-details">
              <span>原价：¥{{ comboOffer.totalPrice }}</span>
              <span class="combo-price">优惠价：¥{{ comboOffer.comboPrice }}</span>
              <span class="discount">{{ comboOffer.discount }}% OFF</span>
            </div>
          </el-alert>
        </div>

        <!-- 购物车商品列表 -->
        <el-card class="cart-items" shadow="hover">
          <div class="cart-header">
            <el-checkbox 
              v-model="selectAll" 
              @change="handleSelectAll"
            >
              全选
            </el-checkbox>
            <span class="item-count">共{{ cartItems.length }}件商品</span>
          </div>

          <div class="cart-item" v-for="item in cartItems" :key="item.id">
            <el-checkbox 
              v-model="item.selected" 
              @change="updateTotal"
            />
            
            <div class="item-image">
              <img :src="item.images?.[0] || '/images/default-product.png'" :alt="item.name" />
            </div>
            
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p class="item-description">{{ item.description }}</p>
              <div class="item-tags">
                <el-tag size="small" type="info">{{ item.category }}</el-tag>
                <el-tag size="small" v-if="item.rating >= 4.5" type="success">高评分</el-tag>
              </div>
            </div>
            
            <div class="item-price">
              <span class="current-price">¥{{ item.price }}</span>
              <span class="original-price" v-if="item.originalPrice > item.price">
                ¥{{ item.originalPrice }}
              </span>
            </div>
            
            <div class="item-quantity">
              <el-input-number 
                v-model="item.quantity" 
                :min="1" 
                :max="item.stock"
                @change="updateTotal"
              />
            </div>
            
            <div class="item-subtotal">
              ¥{{ (item.price * item.quantity).toFixed(2) }}
            </div>
            
            <div class="item-actions">
              <el-button 
                type="danger" 
                size="small" 
                text 
                @click="removeItem(item.id)"
              >
                删除
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 结算区域 -->
        <div class="checkout-section">
          <el-card class="checkout-card" shadow="hover">
            <h3>订单总计</h3>
            
            <div class="price-breakdown">
              <div class="price-item">
                <span>商品总价：</span>
                <span>¥{{ subtotal.toFixed(2) }}</span>
              </div>
              
              <div v-if="comboDiscount > 0" class="price-item discount">
                <span>组合优惠：</span>
                <span>-¥{{ comboDiscount.toFixed(2) }}</span>
              </div>
              
              <div class="price-item">
                <span>运费：</span>
                <span v-if="subtotal >= 99">免运费</span>
                <span v-else>¥10.00</span>
              </div>
              
              <el-divider />
              
              <div class="price-item total">
                <span>实付金额：</span>
                <span class="total-price">¥{{ finalTotal.toFixed(2) }}</span>
              </div>
            </div>
            
            <div class="checkout-actions">
              <el-button 
                type="primary" 
                size="large" 
                @click="proceedToCheckout"
                :disabled="selectedItems.length === 0"
                class="checkout-btn"
              >
                结算 ({{ selectedItems.length }})
              </el-button>
              
              <el-button 
                size="large" 
                @click="continueShopping"
              >
                继续购物
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'

const router = useRouter()

// 购物车数据
const cartItems = ref([])
const selectAll = ref(false)
const comboOffer = ref(null)

// 计算选中的商品
const selectedItems = computed(() => {
  return cartItems.value.filter(item => item.selected)
})

// 计算小计
const subtotal = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
})

// 计算组合优惠折扣
const comboDiscount = computed(() => {
  if (comboOffer.value && selectedItems.value.length >= 2) {
    // 如果选中的商品符合组合优惠条件
    const originalTotal = selectedItems.value.reduce((total, item) => {
      return total + (item.originalPrice || item.price) * item.quantity
    }, 0)
    return originalTotal - subtotal.value
  }
  return 0
})

// 计算最终总价
const finalTotal = computed(() => {
  let total = subtotal.value - comboDiscount.value
  
  // 运费计算（满99免运费）
  if (total < 99 && total > 0) {
    total += 10
  }
  
  return Math.max(0, total)
})

// 更新总价
const updateTotal = () => {
  // 检查是否全选
  selectAll.value = cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
  
  // 保存到localStorage
  saveCart()
}

// 全选/取消全选
const handleSelectAll = (checked) => {
  cartItems.value.forEach(item => {
    item.selected = checked
  })
  updateTotal()
}

// 移除商品
const removeItem = async (itemId) => {
  try {
    await ElMessageBox.confirm('确定要删除这件商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    cartItems.value = cartItems.value.filter(item => item.id !== itemId)
    updateTotal()
    
    ElMessage({
      message: '商品已删除',
      type: 'success'
    })
  } catch {
    // 用户取消删除
  }
}

// 继续购物
const continueShopping = () => {
  router.push('/diagnosis')
}

// 前往首页
const goToHome = () => {
  router.push('/')
}

// 结算
const proceedToCheckout = () => {
  if (selectedItems.value.length === 0) {
    ElMessage({
      message: '请选择要结算的商品',
      type: 'warning'
    })
    return
  }
  
  // 保存选中的商品到localStorage
  const checkoutData = {
    items: selectedItems.value,
    subtotal: subtotal.value,
    comboDiscount: comboDiscount.value,
    finalTotal: finalTotal.value,
    comboOffer: comboOffer.value
  }
  
  localStorage.setItem('checkoutData', JSON.stringify(checkoutData))
  
  // 跳转到结算页面
  router.push('/checkout')
}

// 保存购物车
const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cartItems.value))
}

// 加载购物车
const loadCart = () => {
  try {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      cartItems.value = JSON.parse(savedCart).map(item => ({
        ...item,
        selected: true  // 默认全选
      }))
    }
    
    const savedComboOffer = localStorage.getItem('comboOffer')
    if (savedComboOffer) {
      comboOffer.value = JSON.parse(savedComboOffer)
    }
    
    selectAll.value = cartItems.value.length > 0
    
  } catch (error) {
    console.warn('加载购物车失败:', error)
  }
}

onMounted(() => {
  loadCart()
})
</script>

<style scoped>
.cart {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.empty-cart {
  text-align: center;
  margin: 50px 0;
}

.combo-info {
  margin-bottom: 20px;
}

.combo-details {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  font-size: 14px;
}

.combo-price {
  color: #e74c3c;
  font-weight: bold;
}

.discount {
  color: #27ae60;
  font-weight: bold;
}

.cart-items {
  margin-bottom: 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.item-count {
  color: #666;
  font-size: 14px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 20px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.item-description {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.item-tags {
  margin-top: 8px;
}

.item-tags .el-tag {
  margin-right: 8px;
}

.item-price {
  width: 100px;
  text-align: center;
}

.current-price {
  color: #e74c3c;
  font-weight: bold;
  display: block;
}

.original-price {
  color: #bdc3c7;
  text-decoration: line-through;
  font-size: 12px;
}

.item-quantity {
  width: 120px;
}

.item-subtotal {
  width: 100px;
  text-align: center;
  font-weight: bold;
  color: #e74c3c;
}

.item-actions {
  width: 80px;
  text-align: center;
}

.checkout-section {
  position: sticky;
  bottom: 20px;
}

.checkout-card {
  background: white;
}

.checkout-card h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.price-breakdown {
  margin-bottom: 20px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.price-item.discount {
  color: #27ae60;
}

.price-item.total {
  font-size: 18px;
  font-weight: bold;
}

.total-price {
  color: #e74c3c;
  font-size: 24px;
}

.checkout-actions {
  display: flex;
  gap: 15px;
}

.checkout-btn {
  flex: 1;
  height: 50px;
  font-size: 16px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    gap: 15px;
  }
  
  .item-price,
  .item-quantity,
  .item-subtotal,
  .item-actions {
    width: 100%;
    text-align: left;
  }
  
  .checkout-actions {
    flex-direction: column;
  }
}
</style>