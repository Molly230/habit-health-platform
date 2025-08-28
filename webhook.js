const express = require('express')
const { exec } = require('child_process')
const crypto = require('crypto')
const app = express()

app.use(express.json())

// GitHub webhook处理
app.post('/webhook', (req, res) => {
  console.log('收到GitHub webhook请求')
  
  // 可选：验证GitHub签名（推荐）
  // const signature = req.headers['x-hub-signature-256']
  // const secret = 'your-webhook-secret'  // 在GitHub设置的密钥
  
  // 执行部署命令
  const deployCommand = `
    cd /root/your-project-path &&
    git pull origin main &&
    npm install &&
    npm run build &&
    pm2 restart all
  `
  
  exec(deployCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('部署失败:', error)
      return res.status(500).send('部署失败')
    }
    
    console.log('部署成功:', stdout)
    if (stderr) console.log('警告:', stderr)
    
    res.send('部署完成')
  })
})

app.listen(3001, () => {
  console.log('Webhook服务器运行在端口3001')
})