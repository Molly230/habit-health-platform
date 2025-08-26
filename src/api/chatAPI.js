import axios from 'axios'
import { apiConfig } from '../config/api.js'

// 创建axios实例 - 自动适配环境
const chatHttp = axios.create({
  baseURL: `${apiConfig.baseURL}/chat`,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
chatHttp.interceptors.request.use(
  (config) => {
    // 发送聊天请求
    return config
  },
  (error) => {
    // 请求配置错误
    return Promise.reject(error)
  }
)

// 响应拦截器
chatHttp.interceptors.response.use(
  (response) => {
    // 收到聊天响应
    return response.data
  },
  (error) => {
    // 聊天服务错误
    
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请检查网络连接'))
    } else if (error.response) {
      const errorMessage = error.response.data?.error || '服务器错误'
      return Promise.reject(new Error(errorMessage))
    } else if (error.request) {
      return Promise.reject(new Error('无法连接到中医智能助手服务'))
    } else {
      return Promise.reject(new Error('请求配置错误'))
    }
  }
)

// 聊天API接口
export const chatAPI = {
  // 发送消息
  async sendMessage(data) {
    try {
      const response = await chatHttp.post('/message', {
        message: data.message,
        conversationId: data.conversationId,
        userId: data.userId
      })
      return response
    } catch (error) {
      // 发送消息失败
      throw error
    }
  },

  // 健康检查
  async healthCheck() {
    try {
      const response = await chatHttp.get('/health')
      return response
    } catch (error) {
      // 健康检查失败
      throw new Error('中医智能助手服务不可用')
    }
  },

  // 获取知识库主题
  async getKnowledgeTopics() {
    try {
      const response = await chatHttp.get('/knowledge')
      return response
    } catch (error) {
      // 获取知识库失败
      throw error
    }
  }
}

export default chatAPI