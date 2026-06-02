import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/types'
import type { ScreenshotResult, AIResultPayload, AIErrorPayload, AIProgressPayload } from '../shared/types'

const electronAPI = {
  capture: {
    confirm: (selection: { x: number; y: number; width: number; height: number }, imageBase64: string): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.CAPTURE_CONFIRM, selection, imageBase64),
    cancel: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.CAPTURE_CANCEL),
    copyImage: (imageBase64: string): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.CAPTURE_COPY_IMAGE, imageBase64),
    saveImage: (imageBase64: string): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.CAPTURE_SAVE_IMAGE, imageBase64),
    pinImage: (imageBase64: string): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.CAPTURE_PIN_IMAGE, imageBase64),
    onScreenshot: (callback: (data: ScreenshotResult) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: ScreenshotResult): void => {
        callback(data)
      }
      ipcRenderer.on(IPC_CHANNELS.CAPTURE_SCREENSHOT, handler)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.CAPTURE_SCREENSHOT, handler)
    }
  },
  settings: {
    open: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_OPEN),
    get: (key: string): Promise<unknown> => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET, key),
    set: (key: string, value: unknown): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, key, value)
  },
  pin: {
    onImageData: (callback: (data: string) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: string): void => {
        callback(data)
      }
      ipcRenderer.on('pin:image-data', handler)
      return () => ipcRenderer.removeListener('pin:image-data', handler)
    },
    getImage: (): Promise<string> =>
      ipcRenderer.invoke(IPC_CHANNELS.PIN_GET_IMAGE),
    resize: (width: number, height: number): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.PIN_RESIZE, width, height),
    move: (deltaX: number, deltaY: number): void => {
      ipcRenderer.send(IPC_CHANNELS.PIN_MOVE, deltaX, deltaY)
    }
  },
  ai: {
    analyze: (params: {
      imageBase64: string
      config: { apiKey: string; apiBaseUrl: string; modelId: string; maxTokens: number }
    }): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.AI_ANALYZE, params),
    translate: (params: {
      imageBase64: string
      sourceLang: string
      targetLang: string
      config: { apiKey: string; apiBaseUrl: string; modelId: string; maxTokens: number }
    }): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.AI_TRANSLATE, params),
    cancel: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.AI_CANCEL),
    onResult: (callback: (result: AIResultPayload) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, result: AIResultPayload): void => {
        callback(result)
      }
      ipcRenderer.on(IPC_CHANNELS.AI_RESULT, handler)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.AI_RESULT, handler)
    },
    onError: (callback: (error: AIErrorPayload) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, error: AIErrorPayload): void => {
        callback(error)
      }
      ipcRenderer.on(IPC_CHANNELS.AI_ERROR, handler)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.AI_ERROR, handler)
    },
    onLoading: (callback: (loading: boolean) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, loading: boolean): void => {
        callback(loading)
      }
      ipcRenderer.on(IPC_CHANNELS.AI_LOADING, handler)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.AI_LOADING, handler)
    },
    onProgress: (callback: (progress: AIProgressPayload) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, progress: AIProgressPayload): void => {
        callback(progress)
      }
      ipcRenderer.on(IPC_CHANNELS.AI_PROGRESS, handler)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.AI_PROGRESS, handler)
    }
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
