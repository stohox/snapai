## Why

日常办公和学习中，用户截图后需要手动切换到浏览器或其他工具进行 AI 识图或翻译，流程割裂、效率低下。需要一个"截图即智能"的 Windows 桌面工具，截完图直接在旁边获得 AI 识别和翻译结果。

## What Changes

- 新建 Electron + React 桌面应用项目（SnapAI）
- 实现快捷键触发的全屏选区截图功能（支持多显示器）
- 实现 AI 识图功能（通过 OpenAI 兼容 Vision API，含 Prompt 模板）
- 实现 OCR + 翻译功能（AI 一次调用完成识别与翻译，含 Prompt 模板）
- 实现浮动结果窗口（独立 BrowserWindow，支持拖拽、Pin、关闭截图层后保留）
- 实现设置面板（API Key、模型、快捷键、语言对配置，使用 electron-store 持久化）
- 实现系统托盘（最小化到托盘、右键菜单、关于窗口）
- 实现截图复制/保存功能（Renderer Canvas 裁剪）
- 实现 API Key 加密存储（Electron safeStorage）
- 实现首次使用引导流程
- 定义完整 IPC 通道接口契约
- 实现 GitHub Actions CI/CD 自动构建发布
- 实现 GitHub Pages 下载页面

## Capabilities

### New Capabilities
- `screenshot-capture`: 截图捕获功能，包括快捷键触发、多显示器支持、全屏选区拖拽、Canvas 裁剪
- `ai-vision`: AI 识图功能，包括 Vision API 调用、Prompt 模板、模型预设、自定义接口、超时与错误处理
- `ocr-translation`: OCR 翻译功能，包括一次 API 调用完成 OCR + 翻译、翻译 Prompt 模板、多语言支持
- `result-window`: 浮动结果窗口，包括独立 BrowserWindow 定位、Markdown 渲染、翻译对照、Pin 固定、拖拽移动
- `settings-panel`: 设置面板，包括 API Key 配置、模型选择、快捷键设置、翻译语言对、electron-store 持久化
- `system-tray`: 系统托盘与关于窗口，包括托盘图标、右键菜单、双击截图、关于窗口
- `onboarding`: 首次使用引导，包括首次启动检测、引导窗口、跳过引导
- `security`: 安全与隐私，包括 API Key 加密存储、HTTPS 通信、无遥测、截图不落盘
- `ipc-contract`: IPC 通道接口契约，包括所有通道定义和 TypeScript 类型安全
- `build-release`: 打包与发布，包括 electron-builder 便携版、GitHub Actions CI/CD、GitHub Pages 下载页

### Modified Capabilities

## Impact

- 全新项目，无现有代码受影响
- 依赖：electron、react、openai SDK、zustand、tailwindcss、electron-store、electron-builder
- 目标平台：Windows 10/11（日后兼容 macOS）
- 分发：GitHub Releases + GitHub Pages
