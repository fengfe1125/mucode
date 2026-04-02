# Mu Code

[English](#english) | [简体中文](#chinese)

<a name="english"></a>
## English

Mu Code is a powerful, lightweight agentic IDE harness inspired by Claude Code. It features a modern web UI to orchestrate AI agents that can directly interact with your local file system and execute terminal commands.

### 🌟 Features
- **Agentic Loop**: Real-time tool orchestration (Bash, File I/O).
- **Multi-LLM Support**: Seamlessly switch between **Anthropic (Claude 3.5)** and **OpenAI (GPT-4o)**.
- **Bilingual Interface**: Toggle between English and Simplified Chinese in one click.
- **Modern UI**: Minimalist dark-themed chat interface with real-time tool execution logs.
- **Persistent Config**: Easy API management via the UI settings sidebar.

### 🚀 Getting Started

#### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

#### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/fengfe1125/mucode.git
   cd mucode
   ```

2. Install dependencies for both Backend and Frontend:
   ```bash
   # Install Backend
   cd backend && npm install
   # Install Frontend
   cd ../frontend && npm install
   ```

#### Running the Application
1. Start the Backend server (default port 3001):
   ```bash
   cd backend
   npm start
   ```
2. Start the Frontend dev server (default port 5173):
   ```bash
   cd ../frontend
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

<a name="chinese"></a>
## 简体中文

Mu Code 是一款受 Claude Code 启发的高效、轻量级 AI Agent 编程辅助工具。它提供了一个现代化的 Web 界面，用于编排能够直接与本地文件系统交互并执行终端命令的 AI 智能体。

### 🌟 核心功能
- **自主循环 (Agentic Loop)**：实时编排工具调用（Bash 终端、文件读写）。
- **多模型支持**：支持在 **Anthropic (Claude 3.5)** 和 **OpenAI (GPT-4o)** 之间无缝切换。
- **双语界面**：一键切换中文/英文 UI。
- **现代 UI 设计**：极简深色主题聊天界面，实时展示工具执行日志。
- **持久化配置**：通过侧边栏设置轻松管理 API Key 和模型偏好。

### 🚀 快速开始

#### 前置要求
- Node.js (v18 或更高版本)
- npm 或 yarn

#### 安装步骤
1. 克隆仓库：
   ```bash
   git clone https://github.com/fengfe1125/mucode.git
   cd mucode
   ```

2. 安装依赖：
   ```bash
   # 安装后端依赖
   cd backend && npm install
   # 安装前端依赖
   cd ../frontend && npm install
   ```

#### 启动项目
1. 启动后端服务器 (默认端口 3001)：
   ```bash
   cd backend
   npm start
   ```
2. 启动前端开发服务器 (默认端口 5173)：
   ```bash
   cd ../frontend
   npm run dev
   ```
3. 在浏览器中打开 `http://localhost:5173`。

### 🛠️ 工具说明 (Tools)
- `bash`: 执行终端命令。
- `read_file`: 读取本地文件。
- `write_file`: 创建或覆盖文件。
- `edit_file`: 精准字符串替换（支持代码局部修改）。

---
**License**: MIT  
**Author**: fengfe1125
