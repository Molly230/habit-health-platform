// API配置 - 根据环境自动切换
const API_CONFIG = {
  // 开发环境 - 本地后端
  development: {
    baseURL: 'http://localhost:5000/api',
    timeout: 30000
  },
  
  // 生产环境 - Netlify + ngrok后端
  production: {
    // 优先使用环境变量，如果没有则使用代理
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000
  }
}

// 获取当前环境配置
const getCurrentConfig = () => {
  const env = import.meta.env.MODE || 'development'
  // 当前环境和API地址已配置
  return API_CONFIG[env] || API_CONFIG.development
}

export const apiConfig = getCurrentConfig()
export default apiConfig