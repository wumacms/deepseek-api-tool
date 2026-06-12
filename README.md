# 🐳 DeepSeek Chat 沙箱 (DeepSeek API Tool)

一个基于 Vue 3 + Vite + Tailwind CSS v4 构建的现代、流式、支持思维链（Thinking Process）解析与 LaTeX 数学公式渲染的 DeepSeek API 交互测试沙箱。

本项目完全运行在客户端（Serverless），您的 API Key 安全地保存在本地浏览器的 `localStorage` 中，绝不会被传输到任何第三方服务器。

---

## ✨ 项目特色

- 🧠 **思维链（Thinking Process）完美解析**：完美支持并过滤展示 DeepSeek 官方模型的深度思考过程，配备专属的渐入式微光紫色卡片展示。
- 📐 **LaTeX 数学公式渲染**：集成 **KaTeX** 高性能排版库，支持行内公式（如 `$E=mc^2$`）与行间公式（如 `$$\sum_{i=1}^n i = \frac{n(n+1)}{2}$$`）的实时无缝排版渲染。
- 📝 **Markdown 高级渲染与高亮**：使用 Marked 深度解析 Markdown，并结合 **highlight.js** 实现代码块发光暗色皮肤渲染，且所有代码容器支持一键复制（保留语言声明）。
- 🛠️ **完整 API 参数调试**：
  - 支持自定义 API 接口基地址（方便设置反向代理或私有部署接口）。
  - 支持快捷切换官方最新模型：旗舰模型 `deepseek-v4-pro` 与轻快模型 `deepseek-v4-flash`。
  - 支持设置 **System Prompt** 系统提示词。
  - 支持一键开关思考模式，且在开启时支持设定推理强度控制（`High` / `Max`）。
  - 精确调节 **Temperature**（温度）与 **Max Tokens**（单次最大 token 限制）。
- 📊 **Token 消耗实时计量**：实时展示单次交互的输入 Token、输出 Token、思维链 Token 及**缓存命中 Token（Prompt Cache Hit）**，方便精细化调试与成本估算。
- 💾 **历史会话自动持久化**：所有的配置参数与会话历史均自动同步至本地 `localStorage`，防刷新丢失。
- 📦 **快捷交互控制**：支持**中止流生成（Stop Generation）**、一键复制回答全文、一键下载当前回答为 `.md` 文档，以及快速清除历史记录。
- 📱 **玻璃拟态 & 响应式设计**：精心打磨的 Glassmorphism（玻璃拟态）质感及霓虹暗夜氛围背景。侧边栏支持平滑折叠，完美适配移动端、平板与 PC。

---

## 🛠️ 技术栈

- **核心框架**：Vue 3 (SFC, `<script setup>`, TypeScript)
- **构建工具**：Vite 8
- **样式系统**：Tailwind CSS v4 (基于最新的 `@tailwindcss/vite` 插件)
- **图标库**：Lucide Vue Next
- **文本渲染**：Marked (Markdown 解析) + highlight.js (代码高亮)
- **数学排版**：KaTeX (LaTeX 公式渲染)

---

## 🚀 快速开始

### 本地开发

确保您的电脑已安装 Node.js（推荐 v18 或更高版本）和包管理器 `pnpm`。

1. **克隆仓库**：
   ```bash
   git clone https://github.com/您的用户名/deepseek-api-tool.git
   cd deepseek-api-tool
   ```

2. **安装依赖**：
   ```bash
   pnpm install
   ```

3. **启动开发服务器**：
   ```bash
   pnpm dev
   ```
   启动后，在浏览器中打开 `http://localhost:5173`。

4. **配置 API Key**：
   在左侧配置面板中填入您的官方 DeepSeek API Key（格式为 `sk-...`），即可开始对话！

---

## 📦 生产构建与部署

### 本地构建

将项目打包为高度优化的静态文件：
```bash
pnpm build
```
打包生成的文件将保存在 `dist/` 目录下，您可以将其部署到任何静态文件托管服务（如 Nginx、Vercel、Netlify 等）。

### 🚀 自动部署到 GitHub Pages (GitHub Actions)

本项目已预配置好 GitHub Actions 自动化工作流。只需将代码推送至您的 GitHub 仓库，即可自动完成部署：

1. **修改 Vite 基础路径**：
   打开 [vite.config.ts](vite.config.ts)，确保其中的生产基准路径 `base` 与您的仓库名对应：
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/你的仓库名/' : '/'
   ```

2. **推送代码**：
   ```bash
   git init
   git add .
   git commit -m "deploy: initial commit for sandbox"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```

3. **开启 GitHub Pages 权限**：
   - 打开您的 GitHub 仓库主页。
   - 点击 **Settings** -> **Pages**。
   - 在 **Build and deployment** 部分的 **Source** 选项中选择 **GitHub Actions**。
   - 稍等片刻，即可在部署日志中看到您的在线链接（通常为 `https://<your-username>.github.io/<your-repo>/`）。

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。
