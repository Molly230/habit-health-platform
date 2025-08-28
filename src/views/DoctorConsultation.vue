<template>
  <div class="doctor-consultation">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <el-icon size="32" color="white"><Avatar /></el-icon>
        <div class="header-text">
          <h1>专业健康咨询</h1>
          <p>与资深健康管理师一对一咨询，获得专业的调理建议</p>
        </div>
      </div>
    </div>

    <!-- 返回按钮 -->
    <div class="back-nav">
      <el-button 
        @click="goBack" 
        class="back-button"
        size="default"
        plain
      >
        <el-icon><ArrowLeft /></el-icon>
        返回上一页
      </el-button>
    </div>

    <!-- 医生介绍区域 -->
    <div class="doctors-section">
      <el-row :gutter="20" justify="center">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="doctor in doctors" :key="doctor.id" class="doctor-col">
          <el-card class="doctor-card" shadow="hover">
            <div class="doctor-info">
              <el-avatar :size="80" :src="doctor.avatar" class="doctor-avatar">
                <el-icon><Avatar /></el-icon>
              </el-avatar>
              <div class="doctor-details">
                <h3>{{ doctor.name }}</h3>
                <el-tag :type="doctor.status === '在线' ? 'success' : 'info'" size="small">
                  {{ doctor.status }}
                </el-tag>
                <p class="doctor-title">{{ doctor.title }}</p>
                <p class="doctor-specialty">{{ doctor.specialty }}</p>
                <div class="doctor-experience">
                  <el-icon><Star /></el-icon>
                  <span>{{ doctor.experience }}年经验</span>
                </div>
              </div>
            </div>
            <div class="consultation-options">
              <el-button 
                type="primary" 
                size="large" 
                @click="startConsultation(doctor)"
                :disabled="doctor.status !== '在线'"
                class="consult-btn"
              >
                <el-icon><ChatDotRound /></el-icon>
                立即咨询
              </el-button>
              <div class="consultation-price">
                <span>咨询费：{{ doctor.price }}元/次</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 咨询流程说明 -->
    <div class="process-section">
      <h2>咨询流程</h2>
      <el-steps :active="4" finish-status="success" align-center>
        <el-step title="选择健康顾问" description="选择合适的专业健康管理师">
          <template #icon>
            <el-icon><UserFilled /></el-icon>
          </template>
        </el-step>
        <el-step title="提交情况" description="描述症状和评估结果">
          <template #icon>
            <el-icon><Edit /></el-icon>
          </template>
        </el-step>
        <el-step title="专业分析" description="健康管理师分析情况">
          <template #icon>
            <el-icon><View /></el-icon>
          </template>
        </el-step>
        <el-step title="获得方案" description="获得个性化调理方案">
          <template #icon>
            <el-icon><Document /></el-icon>
          </template>
        </el-step>
      </el-steps>
    </div>

    <!-- 咨询对话框 -->
    <el-dialog
      v-model="consultationDialogVisible"
      :title="`咨询 ${selectedDoctor?.name} 健康管理师`"
      width="70%"
      :before-close="handleDialogClose"
    >
      <div class="consultation-form" v-if="!consultationStarted">
        <el-form :model="consultationForm" :rules="consultationRules" ref="consultationFormRef">
          <el-form-item label="患者姓名" prop="patientName">
            <el-input v-model="consultationForm.patientName" placeholder="请输入真实姓名" />
          </el-form-item>
          
          <el-form-item label="年龄" prop="age">
            <el-input-number 
              v-model="consultationForm.age" 
              :min="1" 
              :max="120" 
              placeholder="年龄"
            />
          </el-form-item>
          
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="consultationForm.gender">
              <el-radio label="男">男</el-radio>
              <el-radio label="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="consultationForm.phone" placeholder="请输入手机号码" />
          </el-form-item>
          
          <el-form-item label="主要症状" prop="symptoms">
            <el-input 
              v-model="consultationForm.symptoms" 
              type="textarea" 
              :rows="4"
              placeholder="请详细描述您的失眠症状，如入睡困难、早醒、多梦等..."
            />
          </el-form-item>
          
          <el-form-item label="症状持续时间" prop="duration">
            <el-select v-model="consultationForm.duration" placeholder="请选择">
              <el-option label="1周以内" value="1周以内" />
              <el-option label="1-4周" value="1-4周" />
              <el-option label="1-3个月" value="1-3个月" />
              <el-option label="3-6个月" value="3-6个月" />
              <el-option label="半年以上" value="半年以上" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="用药史" prop="medicationHistory">
            <el-input 
              v-model="consultationForm.medicationHistory" 
              type="textarea" 
              :rows="2"
              placeholder="请说明是否服用过安眠药或其他治疗药物"
            />
          </el-form-item>
          
          <el-form-item label="评估结果" v-if="diagnosisData">
            <div class="diagnosis-summary">
              <el-tag type="info">睡眠质量：{{ diagnosisData.sleep_grade || '未评估' }}</el-tag>
              <el-tag type="warning" style="margin-left: 8px">
                证型：{{ diagnosisData.syndrome_type || '未确定' }}
              </el-tag>
            </div>
            <el-checkbox v-model="consultationForm.includeDiagnosis">
              将我的问卷评估结果一并发送给健康管理师
            </el-checkbox>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 咨询进行中界面 -->
      <div class="consultation-chat" v-else>
        <div class="chat-messages" ref="chatContainer">
          <div 
            v-for="message in consultationMessages" 
            :key="message.id"
            class="message-item"
            :class="message.sender"
          >
            <div class="message-content">
              <div class="sender-info">
                <el-avatar :size="32" :src="message.avatar">
                  <el-icon><Avatar /></el-icon>
                </el-avatar>
                <span class="sender-name">{{ message.senderName }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-text" v-html="formatMessage(message.content)"></div>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <el-input
            v-model="newMessage"
            type="textarea"
            :rows="3"
            placeholder="向健康管理师描述您的问题..."
            @keydown.ctrl.enter="sendMessage"
          />
          <div class="chat-actions">
            <el-button @click="endConsultation" size="small">结束咨询</el-button>
            <el-button type="primary" @click="sendMessage" :disabled="!newMessage.trim()">
              发送消息
            </el-button>
          </div>
        </div>
      </div>
      
      <template #footer v-if="!consultationStarted">
        <span class="dialog-footer">
          <el-button @click="consultationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitConsultation">
            开始咨询 ({{ selectedDoctor?.price }}元)
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 咨询须知 -->
    <div class="notice-section">
      <el-alert
        title="咨询须知"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <ul class="notice-list">
            <li>本平台顾问均为专业健康管理师，仅提供健康调理建议</li>
            <li>咨询内容仅供健康参考，不构成医疗建议</li>
            <li>身体不适请及时到正规医疗机构就诊</li>
            <li>咨询费用支付后不可退款，请慎重选择</li>
            <li>咨询记录将严格保密，仅医患双方可见</li>
          </ul>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { 
  Avatar, 
  Star, 
  ChatDotRound,
  UserFilled,
  Edit,
  View,
  Document,
  ArrowLeft
} from '@element-plus/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const consultationDialogVisible = ref(false)
const consultationStarted = ref(false)
const selectedDoctor = ref(null)
const consultationFormRef = ref(null)
const chatContainer = ref(null)
const newMessage = ref('')
const consultationMessages = ref([])
const diagnosisData = ref(null)

// 模拟医生数据
const doctors = ref([
  {
    id: 1,
    name: '李老师',
    title: '高级健康管理师',
    specialty: '中医调理、失眠专科',
    experience: 25,
    status: '在线',
    price: 50,
    avatar: '/doctor1.jpg'
  },
  {
    id: 2,
    name: '王老师',
    title: '资深健康管理师',
    specialty: '中医养生、睡眠障碍',
    experience: 18,
    status: '在线',
    price: 80,
    avatar: '/doctor2.jpg'
  },
  {
    id: 3,
    name: '张老师',
    title: '专业健康管理师',
    specialty: '中医养生、亚健康调理',
    experience: 12,
    status: '忙碌',
    price: 30,
    avatar: '/doctor3.jpg'
  }
])

// 咨询表单
const consultationForm = reactive({
  patientName: '',
  age: null,
  gender: '',
  phone: '',
  symptoms: '',
  duration: '',
  medicationHistory: '',
  includeDiagnosis: false
})

// 表单验证规则
const consultationRules = {
  patientName: [
    { required: true, message: '请输入患者姓名', trigger: 'blur' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  symptoms: [
    { required: true, message: '请描述主要症状', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请选择症状持续时间', trigger: 'change' }
  ]
}

// 组件挂载时检查是否有诊断数据
onMounted(() => {
  // 尝试从路由参数或本地存储获取诊断数据
  const storedDiagnosis = localStorage.getItem('latestDiagnosis')
  if (storedDiagnosis) {
    try {
      diagnosisData.value = JSON.parse(storedDiagnosis)
    } catch (e) {
    }
  }
})

// 开始咨询
const startConsultation = (doctor) => {
  selectedDoctor.value = doctor
  consultationDialogVisible.value = true
  consultationStarted.value = false
  consultationMessages.value = []
}

// 提交咨询申请
const submitConsultation = async () => {
  if (!consultationFormRef.value) return
  
  try {
    await consultationFormRef.value.validate()
    
    // 模拟支付流程
    await ElMessageBox.confirm(
      `确认向 ${selectedDoctor.value.name} 支付 ${selectedDoctor.value.price}元咨询费？`,
      '确认支付',
      { type: 'warning' }
    )
    
    // 开始咨询会话
    consultationStarted.value = true
    
    // 添加系统欢迎消息
    const welcomeMessage = {
      id: Date.now(),
      sender: 'doctor',
      senderName: selectedDoctor.value.name,
      content: `您好 ${consultationForm.patientName}，我是${selectedDoctor.value.name}健康管理师。我已经收到您的咨询申请和症状描述，现在开始为您分析情况。请问您还有什么需要补充的症状吗？`,
      timestamp: new Date(),
      avatar: selectedDoctor.value.avatar
    }
    consultationMessages.value.push(welcomeMessage)
    
    // 如果包含诊断结果，发送给医生
    if (consultationForm.includeDiagnosis && diagnosisData.value) {
      const diagnosisMessage = {
        id: Date.now() + 1,
        sender: 'system',
        senderName: '系统',
        content: `用户的问卷评估结果：<br>睡眠质量等级：${diagnosisData.value.sleep_grade}<br>体质类型：${diagnosisData.value.syndrome_type}`,
        timestamp: new Date(),
        avatar: '/system.png'
      }
      consultationMessages.value.push(diagnosisMessage)
    }
    
    ElMessage.success('咨询已开始，请耐心等待健康管理师回复')
    
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消支付')
    } else {
      ElMessage.error('提交失败，请检查表单信息')
    }
  }
}

// 发送消息
const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  const userMessage = {
    id: Date.now(),
    sender: 'patient',
    senderName: consultationForm.patientName,
    content: newMessage.value.trim(),
    timestamp: new Date(),
    avatar: '/user-avatar.png'
  }
  
  consultationMessages.value.push(userMessage)
  
  // 模拟健康管理师回复（实际应该通过WebSocket或轮询获取）
  setTimeout(() => {
    const doctorReply = generateDoctorReply(newMessage.value)
    const replyMessage = {
      id: Date.now() + 1,
      sender: 'doctor',
      senderName: selectedDoctor.value.name,
      content: doctorReply,
      timestamp: new Date(),
      avatar: selectedDoctor.value.avatar
    }
    consultationMessages.value.push(replyMessage)
  }, 2000 + Math.random() * 3000)
  
  newMessage.value = ''
  
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 生成健康管理师回复（模拟智能回复）
const generateDoctorReply = (userInput) => {
  const replies = [
    '根据您描述的症状，建议您注意作息规律，避免睡前过度用脑。我推荐您试试按摩神门穴和三阴交穴。',
    '您的情况可能是压力导致的失眠。建议平时多做深呼吸，保持心情舒畅。可以考虑一些舒缓的调理方法。',
    '失眠时间较长需要综合调理。生活调理很重要，建议您每天固定时间入睡，睡前2小时避免剧烈运动。',
    '从调理角度看，建议您可以尝试食疗，如百合莲子汤、酸枣仁茶等。同时要注意情志调节。'
  ]
  return replies[Math.floor(Math.random() * replies.length)]
}

// 结束咨询
const endConsultation = async () => {
  try {
    await ElMessageBox.confirm('确定结束本次咨询吗？', '确认', {
      type: 'warning'
    })
    
    consultationDialogVisible.value = false
    consultationStarted.value = false
    ElMessage.success('咨询已结束，感谢您的使用')
  } catch {
    // 用户取消
  }
}

// 关闭对话框
const handleDialogClose = (done) => {
  if (consultationStarted.value) {
    ElMessageBox.confirm('咨询进行中，确定要关闭吗？')
      .then(() => {
        done()
      })
      .catch(() => {})
  } else {
    done()
  }
}

// 格式化消息
const formatMessage = (content) => {
  return content.replace(/\n/g, '<br>')
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.doctor-consultation {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  background: linear-gradient(135deg, #409EFF 0%, #6bb6ff 100%);
  color: white;
  padding: 40px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-nav {
  margin: 20px 0;
  padding-left: 20px;
}

.back-button {
  color: #409EFF;
  border: 1px solid #409EFF;
  background: white;
  transition: all 0.3s;
}

.back-button:hover {
  background: #409EFF;
  color: white;
  transform: translateX(-2px);
}

.header-text h1 {
  margin: 0 0 10px;
  font-size: 28px;
  font-weight: bold;
}

.header-text p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.doctors-section, .process-section, .notice-section {
  margin-bottom: 40px;
}

.doctors-section h2, .process-section h2 {
  color: #409EFF;
  margin-bottom: 20px;
  font-size: 22px;
  text-align: center;
}

.doctor-col {
  margin-bottom: 20px;
}

.doctor-card {
  height: 300px;
  transition: transform 0.3s;
  max-width: 280px;
  margin: 0 auto;
}

.doctor-card:hover {
  transform: translateY(-3px);
}

.doctor-info {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.doctor-avatar {
  flex-shrink: 0;
}

.doctor-details h3 {
  margin: 0 0 5px;
  color: #303133;
  font-size: 18px;
}

.doctor-title {
  color: #409EFF;
  font-weight: 500;
  margin: 5px 0;
}

.doctor-specialty {
  color: #606266;
  font-size: 14px;
  margin: 8px 0;
}

.doctor-experience {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #E6A23C;
  font-size: 14px;
}

.consultation-options {
  text-align: center;
}

.consult-btn {
  width: 100%;
  margin-bottom: 10px;
}

.consultation-price {
  color: #F56C6C;
  font-weight: 500;
}

.process-section {
  padding: 30px;
  background: #f9f9f9;
  border-radius: 8px;
}

.consultation-form .el-form-item {
  margin-bottom: 20px;
}

.diagnosis-summary {
  margin-bottom: 10px;
}

.consultation-chat {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 15px;
}

.message-item {
  margin-bottom: 20px;
}

.message-item.doctor .message-content {
  background: #f0f9ff;
  border-left: 3px solid #409EFF;
}

.message-item.patient .message-content {
  background: #f6f8fa;
  border-left: 3px solid #67C23A;
}

.message-content {
  padding: 15px;
  border-radius: 8px;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.sender-name {
  font-weight: 500;
  color: #409EFF;
}

.message-time {
  color: #909399;
  font-size: 12px;
}

.message-text {
  line-height: 1.6;
  color: #303133;
}

.chat-input {
  border-top: 1px solid #e4e7ed;
  padding-top: 15px;
}

.chat-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.notice-section .el-alert {
  border-radius: 8px;
}

.notice-list {
  margin: 10px 0 0;
  padding-left: 20px;
}

.notice-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .doctors-section .el-col {
    margin-bottom: 20px;
  }
  
  .doctor-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>