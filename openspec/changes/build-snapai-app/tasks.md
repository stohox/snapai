## 1. 项目初始化与基础架构

- [x] 1.1 使用 electron-vite 初始化项目，配置 TypeScript、React、Tailwind CSS
- [x] 1.2 搭建项目目录结构（src/main、src/utility、src/renderer、src/shared）
- [x] 1.3 配置 Main Process 入口（窗口管理、应用生命周期）
- [x] 1.4 配置 Utility Process 入口（独立进程启动与 IPC 通信基础）
- [x] 1.5 配置 Renderer Process 入口（React App、preload 脚本）
- [x] 1.6 定义共享类型（src/shared/types.ts IPC 通信类型定义、constants.ts 默认值与 Prompt 模板、models.ts 模型预设）
- [x] 1.7 定义 IPC 通道接口契约，包含所有 Renderer→Main、Main→Utility、Utility→Main、Main→Renderer 通道及 TypeScript 类型
- [x] 1.8 验证 `npm run dev` 可正常启动三进程架构

## 2. 截图捕获功能

- [x] 2.1 实现全局快捷键注册与管理（src/main/shortcut.ts），默认 Ctrl+Shift+A
- [x] 2.2 实现屏幕捕获（src/main/capture.ts），使用 desktopCapturer 获取屏幕图像，支持多显示器合成
- [x] 2.3 实现全屏透明截图覆盖层窗口创建与销毁，覆盖所有显示器
- [x] 2.4 实现选区拖拽组件（CaptureOverlay.tsx + SelectionBox.tsx），支持创建、调整大小、移动选区，支持跨屏选区
- [x] 2.5 实现选区确认（双击/回车）和取消（ESC/右键）
- [x] 2.6 实现选区截图裁剪（Renderer Canvas 裁剪），将裁剪后图片数据通过 IPC 传递给 Main Process
- [x] 2.7 实现选区操作工具栏（Toolbar.tsx），包含 AI 识图、OCR 翻译、复制图片、保存图片四个按钮
- [x] 2.8 实现工具栏定位逻辑（紧贴选区下方，不超出屏幕边界）
- [x] 2.9 实现 API Key 未配置时 AI 按钮置灰与提示逻辑
- [x] 2.10 实现复制截图到剪贴板功能（Renderer Canvas 导出图片）
- [x] 2.11 实现保存截图到本地功能（系统文件保存对话框，默认 PNG 格式）
- [x] 2.12 验证截图响应时间 < 200ms

## 3. AI 识图与翻译服务

- [x] 3.1 实现图片预处理工具（src/utility/image-utils.ts），base64 编码与压缩
- [x] 3.2 实现 AI 服务（src/utility/ai-service.ts），使用 openai SDK 发送 Vision API 请求
- [x] 3.3 实现识图 Prompt 模板（src/shared/constants.ts），定义默认识图 Prompt
- [x] 3.4 实现翻译服务（src/utility/translate-service.ts），一次 API 调用完成 OCR + 翻译
- [x] 3.5 实现翻译 Prompt 模板（src/shared/constants.ts），定义翻译 Prompt，支持语言对动态替换，JSON 格式输出
- [x] 3.6 实现内置模型预设配置（src/shared/models.ts），包含 OpenAI、Claude、通义千问、Kimi、DeepSeek
- [x] 3.7 实现自定义 API 接口支持（用户配置任意 OpenAI 兼容地址）
- [x] 3.8 实现 10 秒请求超时与取消机制
- [x] 3.9 实现错误处理（401/429/500 状态码对应提示信息）
- [x] 3.10 实现截图失败降级方案（desktopCapturer 失败时尝试剪贴板截图）
- [x] 3.11 实现模型返回异常处理（解析失败时显示原始内容并标注"返回内容格式异常"）

## 4. 浮动结果窗口

- [x] 4.1 实现浮动结果窗口（独立 frameless BrowserWindow，alwaysOnTop），支持紧贴选区定位（右侧优先，空间不足则下方）
- [x] 4.2 实现识图结果展示（OcrResult.tsx），Markdown 渲染 + 代码语法高亮
- [x] 4.3 实现翻译结果展示（TranslateResult.tsx），原文/译文上下对照，明确视觉分隔
- [x] 4.4 实现窗口拖拽移动（CSS -webkit-app-region: drag 标题栏区域）
- [x] 4.5 实现 Pin 固定功能（点击外部不自动关闭，Pin 按钮激活状态切换）
- [x] 4.6 实现关闭截图覆盖层时浮动窗口行为（Pin 保留浮动窗口，未 Pin 则同时关闭）
- [x] 4.7 实现一键复制结果文字到剪贴板，显示"已复制"提示
- [x] 4.8 实现加载状态和错误状态展示（含重试按钮）

## 5. 设置面板

- [x] 5.1 实现设置面板窗口（SettingsPanel.tsx），包含四个配置区域
- [x] 5.2 实现 API Key 配置（密码掩码输入 + safeStorage 加密存储到 electron-store）
- [x] 5.3 实现模型选择（预设列表 + 自定义模式切换，选择预设自动填充 API 地址）
- [x] 5.4 实现快捷键设置（按键录制 + 冲突检测）
- [x] 5.5 实现翻译语言对配置（源语言/目标语言下拉选择，至少支持中、英、日、韩、法、德、西）
- [x] 5.6 实现设置持久化（electron-store），应用重启后自动恢复设置

## 6. 系统托盘与关于窗口

- [x] 6.1 实现系统托盘图标与右键菜单（截图、设置、关于、退出）
- [x] 6.2 实现关闭窗口后最小化到托盘（不退出应用）
- [x] 6.3 实现双击托盘图标触发截图
- [x] 6.4 实现关于窗口（应用名称 SnapAI、版本号、GitHub 仓库链接、MIT 协议，固定大小不可调整）

## 7. 首次使用引导

- [x] 7.1 实现首次启动检测（electron-store 中无配置记录）
- [x] 7.2 实现引导窗口（应用简介、API Key 配置入口、快捷键说明）
- [x] 7.3 实现跳过引导功能（直接最小化到托盘）

## 8. IPC 通信与状态管理

- [x] 8.1 实现 IPC 通信处理（src/main/ipc-handlers.ts），按接口契约实现所有 IPC 通道
- [x] 8.2 实现 Zustand 状态管理（截图状态、AI 请求状态、设置状态）
- [x] 8.3 实现 preload 脚本，暴露类型安全的 IPC 调用接口给 Renderer

## 9. 安全与隐私

- [x] 9.1 实现 API Key 加密存储（safeStorage.encryptString/decryptString），确保磁盘无明文
- [x] 9.2 确保所有 AI 请求使用 HTTPS 协议
- [x] 9.3 确保截图数据不自动缓存到磁盘（仅存在于内存中）
- [x] 9.4 确保不收集用户数据、不发送遥测

## 10. 打包与发布

- [x] 10.1 配置 electron-builder 打包为 Windows 便携版 .zip
- [x] 10.2 配置应用图标和元数据
- [x] 10.3 创建 GitHub Actions 工作流（.github/workflows/release.yml），v*.*.* tag 触发自动构建发布
- [x] 10.4 创建 GitHub Pages 下载页面（应用介绍 + 通过 GitHub API 获取最新 Release 下载链接，响应式设计）
