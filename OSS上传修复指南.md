# 阿里云OSS上传修复指南

## 🚨 常见上传失败原因

### 1. **路径错误（最常见）**
❌ **错误做法**：上传整个 `dist` 文件夹  
✅ **正确做法**：上传 `dist` 文件夹**内的内容**

**正确的OSS根目录结构应该是：**
```
OSS根目录/
├── index.html           ← 直接在根目录
├── assets/             ← 直接在根目录
│   ├── index-xxx.css
│   └── index-xxx.js
└── vite.svg (可选)
```

❌ **错误结构**：
```
OSS根目录/
└── dist/               ← 多了一层dist目录！
    ├── index.html
    └── assets/
```

### 2. **权限设置错误**
- Bucket读写权限必须是：**公共读**
- 静态网站托管必须：**已开启**

### 3. **上传方式问题**
- 不要用拖拽上传整个文件夹
- 要分别上传文件和文件夹

---

## 🔧 正确上传步骤

### Step 1: 确认构建产物
```bash
# 确保构建成功
npm run build

# 检查dist目录内容
ls dist/
# 应该看到：index.html  assets/
```

### Step 2: OSS控制台操作

#### 2.1 清空现有内容
- 进入你的Bucket
- **删除所有现有文件**（如果有上传错误的话）

#### 2.2 上传index.html
- 点击"上传文件"
- 选择 `F:\360MoveData\Users\administered\Desktop\588\dist\index.html`
- 确保上传到**根目录**（不是dist目录内）

#### 2.3 上传assets文件夹
- 点击"新建目录" → 创建 `assets` 目录
- 进入assets目录
- 上传 `dist\assets\` 内的所有文件：
  - `index-281b5f2f.css`
  - `index-8a0ee702.js`

#### 2.4 检查最终结构
```
你的Bucket根目录/
├── index.html
└── assets/
    ├── index-281b5f2f.css
    └── index-8a0ee702.js
```

### Step 3: 配置静态网站托管
- 左侧菜单：基础设置 → 静态页面
- 开启静态网站托管
- 默认首页：`index.html`
- 默认404页：`index.html` ← **重要！支持Vue Router**

### Step 4: 配置权限
- 左侧菜单：权限管理 → 读写权限
- 选择：**公共读**

---

## 🎯 快速修复命令（推荐）

如果你有阿里云CLI工具，可以用命令行：

```bash
# 安装阿里云CLI工具（如果没有）
# 下载：https://help.aliyun.com/document_detail/110341.html

# 配置你的访问密钥
aliyun configure

# 同步上传dist内容到OSS（替换你的bucket名称）
aliyun oss sync dist/ oss://你的bucket名称/ --delete
```

---

## 🔍 上传后验证

### 1. 检查文件结构
在OSS控制台确认文件结构正确

### 2. 访问测试
- 静态网站域名：`http://你的bucket名称.oss-网站-地域.aliyuncs.com`
- 自定义域名：`http://你的域名`

### 3. 功能测试
- [ ] 首页加载正常
- [ ] CSS样式显示正常  
- [ ] JS功能正常（点击按钮）
- [ ] 路由跳转正常（Vue Router）
- [ ] 诊断功能工作（19题问卷）

---

## 🚨 如果还是不行

### 排查清单：
1. **浏览器开发者工具**查看错误信息
2. **Network面板**看哪些资源加载失败
3. **Console面板**看JS错误

### 常见错误及解决：
- `404 Not Found`：路径错误，检查文件结构
- `403 Forbidden`：权限问题，设置公共读
- 页面空白：JS文件路径错误或加载失败
- 路由404：没有设置404页面为index.html

---

## 📞 如果还需要帮助

告诉我：
1. OSS控制台显示的文件结构截图
2. 浏览器访问时的具体错误信息
3. 开发者工具Console的错误信息

我会帮你进一步排查！

**记住核心要点：上传dist文件夹的内容，不是dist文件夹本身！**