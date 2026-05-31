import { ipcMain, clipboard, dialog, BrowserWindow } from 'electron'
import JsonStore from './store'
import { IPC_CHANNELS } from '../shared/types'
import type { SelectionArea, AIAnalyzeParams, AITranslateParams } from '../shared/types'
import type { WindowManager } from './window-manager'
import { analyzeImage, cancelRequest } from '../utility/ai-service'
import { translateImage } from '../utility/translate-service'
import { nativeImageFromBase64 } from './capture'
import { writeFile } from 'fs/promises'

const store = new JsonStore({
  defaults: {
    apiKey: '',
    apiBaseUrl: 'https://api.openai.com/v1',
    modelId: 'gpt-4o',
    maxTokens: 4096,
    shortcutKey: 'CommandOrControl+Shift+A',
    sourceLang: '英文',
    targetLang: '中文'
  }
})

let lastCaptureResult: { selection: SelectionArea; imageBase64: string } | null = null

export function registerIpcHandlers(windowManager: WindowManager): void {
  ipcMain.handle(
    IPC_CHANNELS.CAPTURE_CONFIRM,
    async (_event, selection: SelectionArea, imageBase64: string) => {
      lastCaptureResult = { selection, imageBase64 }
      windowManager.closeCaptureWindow()
    }
  )

  ipcMain.handle(IPC_CHANNELS.CAPTURE_CANCEL, async () => {
    windowManager.closeCaptureWindow()
  })

  ipcMain.handle(IPC_CHANNELS.CAPTURE_COPY_IMAGE, async (_event, imageBase64: string) => {
    const image = nativeImageFromBase64(imageBase64)
    clipboard.writeImage(image)
    windowManager.closeCaptureWindow()
  })

  ipcMain.handle(IPC_CHANNELS.CAPTURE_SAVE_IMAGE, async (_event, imageBase64: string) => {
    const result = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow() || undefined, {
      defaultPath: `screenshot_${Date.now()}.png`,
      filters: [
        { name: 'PNG 图片', extensions: ['png'] },
        { name: 'JPEG 图片', extensions: ['jpg'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    })

    if (!result.canceled && result.filePath) {
      try {
        const image = nativeImageFromBase64(imageBase64)
        const isJpg = result.filePath.toLowerCase().endsWith('.jpg') || result.filePath.toLowerCase().endsWith('.jpeg')
        const buffer = isJpg ? image.toJPEG(90) : image.toPNG()
        await writeFile(result.filePath, buffer)
      } catch (error) {
        console.error('Failed to save image:', error)
      }
    }
    windowManager.closeCaptureWindow()
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_OPEN, async () => {
    windowManager.createSettingsWindow()
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async (_event, key: string) => {
    return store.get(key)
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, key: string, value: unknown) => {
    store.set(key, value)
  })

  ipcMain.handle(IPC_CHANNELS.AI_ANALYZE, async (event, params: AIAnalyzeParams) => {
    const senderWindow = BrowserWindow.fromWebContents(event.sender)
    const selection = lastCaptureResult?.selection

    windowManager.closeCaptureWindow()
    const resultWindow = windowManager.createResultWindow(selection)
    resultWindow.webContents.send(IPC_CHANNELS.AI_LOADING, true)

    try {
      const result = await analyzeImage(params.imageBase64, params.config)
      windowManager.sendToResultWindow(IPC_CHANNELS.AI_LOADING, false)
      windowManager.sendToResultWindow(IPC_CHANNELS.AI_RESULT, {
        type: 'analyze',
        data: result
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      windowManager.sendToResultWindow(IPC_CHANNELS.AI_LOADING, false)
      windowManager.sendToResultWindow(IPC_CHANNELS.AI_ERROR, {
        type: 'analyze',
        message
      })
    }
  })

  ipcMain.handle(IPC_CHANNELS.AI_TRANSLATE, async (event, params: AITranslateParams) => {
    const senderWindow = BrowserWindow.fromWebContents(event.sender)
    const selection = lastCaptureResult?.selection

    windowManager.closeCaptureWindow()
    const resultWindow = windowManager.createResultWindow(selection)
    resultWindow.webContents.send(IPC_CHANNELS.AI_LOADING, true)

    try {
      const result = await translateImage(
        params.imageBase64,
        params.sourceLang,
        params.targetLang,
        params.config
      )
      windowManager.sendToResultWindow(IPC_CHANNELS.AI_LOADING, false)
      windowManager.sendToResultWindow(IPC_CHANNELS.AI_RESULT, {
        type: 'translate',
        data: result
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      windowManager.sendToResultWindow(IPC_CHANNELS.AI_LOADING, false)
      windowManager.sendToResultWindow(IPC_CHANNELS.AI_ERROR, {
        type: 'translate',
        message
      })
    }
  })

  ipcMain.handle(IPC_CHANNELS.AI_CANCEL, async () => {
    cancelRequest()
    windowManager.sendToResultWindow(IPC_CHANNELS.AI_LOADING, false)
  })
}
