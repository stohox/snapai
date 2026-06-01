# SnapAI - 智能截图工具

一款支持 AI 识图与多语言翻译的 Windows 截图工具。

## 功能特性

- **快捷截图**：Ctrl+Shift+A 一键截图，支持多显示器
- **AI 智能识图**：截图表述、内容提取、代码识别
- **多语言翻译**：OCR + 翻译一体化，支持中英日韩法德西等语言
- **安全隐私**：API Key 加密存储，不收集数据

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
npm run dev
```

### 打包构建

```bash
npm run build:win
```

## 配置 AI

1. 首次使用会提示配置 API Key
2. 支持 OpenAI、Claude、通义千问、Kimi、DeepSeek 等模型
3. 可自定义 API 地址和模型

## 下载

- **在线下载**：https://stohox.github.io/snapai/
- **Releases 页面**：https://github.com/stohox/snapai/releases

## 技术栈

- Electron + electron-vite
- React + TypeScript
- Tailwind CSS
- Zustand
- OpenAI API

## 开源协议

MIT License
