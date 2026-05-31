export const IPC_CHANNELS = {
  CAPTURE_CONFIRM: 'capture:confirm',
  CAPTURE_CANCEL: 'capture:cancel',
  CAPTURE_COPY_IMAGE: 'capture:copy-image',
  CAPTURE_SAVE_IMAGE: 'capture:save-image',
  CAPTURE_SCREENSHOT: 'capture:screenshot',
  SETTINGS_OPEN: 'settings:open',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  AI_ANALYZE: 'ai:analyze',
  AI_TRANSLATE: 'ai:translate',
  AI_CANCEL: 'ai:cancel',
  AI_RESULT: 'ai:result',
  AI_ERROR: 'ai:error',
  AI_PROGRESS: 'ai:progress',
  AI_LOADING: 'ai:loading'
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]

export interface AIConfig {
  apiKey: string
  apiBaseUrl: string
  modelId: string
  maxTokens: number
}

export interface TranslateResult {
  original: string
  translated: string
}

export interface SelectionArea {
  x: number
  y: number
  width: number
  height: number
}

export interface CaptureResult {
  imageBase64: string
  selection: SelectionArea
}

export interface Settings {
  apiKey: string
  apiBaseUrl: string
  modelId: string
  maxTokens: number
  shortcutKey: string
  sourceLang: string
  targetLang: string
}

export interface AIAnalyzeParams {
  imageBase64: string
  config: AIConfig
}

export interface AITranslateParams {
  imageBase64: string
  sourceLang: string
  targetLang: string
  config: AIConfig
}

export interface AIResultPayload {
  type: 'analyze' | 'translate'
  data: string | TranslateResult
}

export interface AIErrorPayload {
  type: 'analyze' | 'translate'
  message: string
  code?: string
}

export interface AIProgressPayload {
  type: 'analyze' | 'translate'
  progress: number
}

export interface DisplayScreenshot {
  imageDataUrl: string
  x: number
  y: number
  width: number
  height: number
}

export interface ScreenshotResult {
  displays: DisplayScreenshot[]
  totalBounds: { x: number; y: number; width: number; height: number }
}

export interface ElectronAPI {
  capture: {
    confirm: (selection: SelectionArea, imageBase64: string) => Promise<void>
    cancel: () => Promise<void>
    copyImage: (imageBase64: string) => Promise<void>
    saveImage: (imageBase64: string) => Promise<void>
    onScreenshot: (callback: (data: ScreenshotResult) => void) => () => void
  }
  settings: {
    open: () => Promise<void>
    get: (key: string) => Promise<unknown>
    set: (key: string, value: unknown) => Promise<void>
  }
  ai: {
    analyze: (params: AIAnalyzeParams) => Promise<void>
    translate: (params: AITranslateParams) => Promise<void>
    cancel: () => Promise<void>
    onResult: (callback: (result: AIResultPayload) => void) => () => void
    onError: (callback: (error: AIErrorPayload) => void) => () => void
    onLoading: (callback: (loading: boolean) => void) => () => void
    onProgress: (callback: (progress: AIProgressPayload) => void) => () => void
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
