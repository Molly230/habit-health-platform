<template>
  <div class="home">
    <!-- 欢迎横幅 -->
    <el-card class="welcome-banner" shadow="hover">
      <div class="banner-content">
        <el-icon class="banner-icon"><Moon /></el-icon>
        <div class="banner-text">
          <h1>欢迎使用失眠健康管理系统</h1>
          <p>基于传统兿生智慧的个性化睡眠健康方案</p>
        </div>
      </div>
    </el-card>

    <!-- 功能介绍 -->
    <el-row :gutter="24" class="feature-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="feature-card" shadow="hover" @click="goToConsultation">
          <div class="feature-content">
            <el-icon class="feature-icon"><ChatRound /></el-icon>
            <h3>智能评估</h3>
            <p>19项专业问题，了解您的睡眠习惯</p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="feature-card" shadow="hover">
          <div class="feature-content">
            <el-icon class="feature-icon"><TrendCharts /></el-icon>
            <h3>体质分析</h3>
            <p>体质分析系统，参考分析体质类型</p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="feature-card" shadow="hover">
          <div class="feature-content">
            <el-icon class="feature-icon"><Setting /></el-icon>
            <h3>个性化建议</h3>
            <p>保健产品、养生方法、食疗参考建议</p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="feature-card" shadow="hover">
          <div class="feature-content">
            <el-icon class="feature-icon"><Document /></el-icon>
            <h3>健康知识</h3>
            <p>丰富的中医失眠知识库，持续学习</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 使用流程 -->
    <el-card class="process-section" shadow="hover">
      <h2>使用流程</h2>
      <el-steps :active="0" align-center>
        <el-step title="健康咨询" description="完成19项健康问题">
          <template #icon>
            <el-icon><Edit /></el-icon>
          </template>
        </el-step>
        <el-step title="智能分析" description="系统分析评估">
          <template #icon>
            <el-icon><Cpu /></el-icon>
          </template>
        </el-step>
        <el-step title="体质分析" description="分析体质类型">
          <template #icon>
            <el-icon><Check /></el-icon>
          </template>
        </el-step>
        <el-step title="调理建议" description="获得个性化建议">
          <template #icon>
            <el-icon><Tickets /></el-icon>
          </template>
        </el-step>
      </el-steps>
    </el-card>

    <!-- 开始按钮 -->
    <div class="start-section">
      <el-button 
        type="primary" 
        size="large" 
        @click="goToConsultation"
        class="start-button"
      >
        <el-icon><Right /></el-icon>
        开始咨询
      </el-button>
    </div>

    <!-- 免责声明 -->
    <el-alert
      title="重要提醒"
      type="warning"
      :closable="false"
      show-icon
    >
      <template #default>
        <p>本平台仅提供健康信息参考，不构成医疗建议。如有身体不适或健康问题，请咨询专业医生。</p>
      </template>
    </el-alert>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { 
  Moon, ChatRound, TrendCharts, Setting, Document, 
  Edit, Cpu, Check, Tickets, Right 
} from '@element-plus/icons-vue'

const router = useRouter()

const goToConsultation = () => {
  router.push('/consultation')
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-banner {
  margin-bottom: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.banner-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.banner-icon {
  font-size: 64px;
  margin-right: 30px;
  opacity: 0.8;
}

.banner-text h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
  font-weight: 300;
}

.banner-text p {
  margin: 0;
  font-size: 18px;
  opacity: 0.9;
}

.feature-cards {
  margin-bottom: 40px;
}

.feature-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-content {
  text-align: center;
  padding: 20px;
}

.feature-icon {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 15px;
}

.feature-content h3 {
  margin: 15px 0;
  color: #2c3e50;
}

.feature-content p {
  color: #7f8c8d;
  line-height: 1.6;
}

.process-section {
  margin-bottom: 40px;
  padding: 30px;
}

.process-section h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.start-section {
  text-align: center;
  margin: 40px 0;
}

.start-button {
  padding: 20px 40px;
  font-size: 18px;
  border-radius: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.el-alert {
  margin-top: 30px;
}
</style>