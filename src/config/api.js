// API配置 - 纯静态模式
const API_CONFIG = {
  // 开发环境 - 本地后端
  development: {
    baseURL: 'http://localhost:5000/api',
    timeout: 30000
  },
  
  // 生产环境 - 纯前端模式，不依赖后端
  production: {
    baseURL: '/api', // 由前端模拟
    timeout: 30000,
    staticMode: true // 启用纯静态模式
  }
}

// 获取当前环境配置
const getCurrentConfig = () => {
  const env = import.meta.env.MODE || 'development'
  return API_CONFIG[env] || API_CONFIG.development
}

export const apiConfig = getCurrentConfig()
export default apiConfig