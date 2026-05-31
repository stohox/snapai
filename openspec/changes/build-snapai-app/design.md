## Context

全新项目，无现有代码。目标构建 Windows 桌面截图工具 SnapAI，集成 AI 识图和翻译。技术栈：Electron + React + TypeScript，双进程分离架构（Main + Utility + Renderer）。

## Goals / Non-Goals

**Goals:**
- 快捷键截图 + 全屏选区拖拽，支持多显示器
- AI 识图和 OCR 翻译通过 OpenAI 兼容 Vision API 实现
- 浮动结果窗口（独立 BrowserWindow）支持 Pin 和拖拽
- 设置面板使用 electron-store 持久化，API Key 加密存储
- 系统托盘 + 首次使用引导 + 关于窗口
- Windows 便携版打包 + GitHub Actions CI/CD + GitHub Pages 下载页

**Non-Goals:**
- macOS 支持（V2）
- 截图标注功能（V2）
- 截图历史记录（V2）
- 自定义 Prompt（V2）
- 专业翻译 API 接入（V2）

## Decisions

### 1. 双进程分离架构（Main + Utility + Renderer）

**选择**: Main Process 负责系统交互，Utility Process 负责耗时 AI 调用，Renderer 负责 UI

**替代方案**:
- 单进程：AI 调用阻塞 UI，不可接受
- 插件化：V1 过度设计

**理由**: 截图工具核心体验是"快"，双进程分离保证 AI 调用不卡界面

### 2. 浮动结果窗口使用独立 BrowserWindow

**选择**: frameless + alwaysOnTop 的独立 BrowserWindow

**替代方案**:
- 同一窗口内 DOM 浮层：Pin 后无法关闭截图覆盖层继续工作

**理由**: 独立窗口允许 Pin 后关闭截图层，浮动窗口独立保留；定位通过坐标计算实现

### 3. 截图裁剪在 Renderer Canvas 中完成

**选择**: Renderer 使用 Canvas 根据选区坐标裁剪，裁剪后数据通过 IPC 传递

**替代方案**:
- Main Process 裁剪：大图需要多次 IPC 传输

**理由**: 避免全屏截图大图多次 IPC 传输，Renderer 已有全屏图数据，直接裁剪最高效

### 4. AI Prompt 使用预定义模板

**选择**: 识图和翻译各有固定 Prompt 模板，用户不可自定义

**替代方案**:
- 用户自定义 Prompt：增加复杂度，V1 不需要

**理由**: 固定 Prompt 保证输出格式一致，翻译 Prompt 使用 JSON 格式返回便于解析

### 5. 设置持久化使用 electron-store

**选择**: electron-store 管理所有设置，API Key 通过 safeStorage 加密后存入

**替代方案**:
- 本地 JSON + safeStorage：需要自己管理文件路径和并发

**理由**: electron-store 成熟稳定，支持加密字段，开箱即用

### 6. 多显示器支持：合成大图

**选择**: desktopCapturer 分别捕获每块屏幕，合成为一张包含所有屏幕的大图

**替代方案**:
- 只截当前活动屏幕：用户可能需要跨屏截图

**理由**: 合成大图后选区可自由跨越屏幕边界，用户体验最自然

## Risks / Trade-offs

- [截图响应时间可能不达标] → 多显示器合成大图可能增加延迟，需要优化图片处理流程
- [Electron 便携版体积较大（~50-80MB）] → 相比原生应用体积大，但换来了跨平台和开发效率
- [AI API 依赖外部服务] → 网络异常时功能不可用，通过错误提示和重试机制缓解
- [openai SDK 版本兼容性] → 国内模型可能不完全兼容 OpenAI 格式，需要测试验证
- [safeStorage 在某些 Windows 环境可能不可用] → 降级为明文存储并警告用户
