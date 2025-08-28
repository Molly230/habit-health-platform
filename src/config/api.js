// API配置 - 环境变量方式
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api'

const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000
}

export { API_BASE_URL, apiConfig }
export default apiConfig