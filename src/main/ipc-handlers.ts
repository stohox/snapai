import { ipcMain, clipboard, dialog, BrowserWindow, screen } from 'electron'
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
let pendingPinImage: string | null = null

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

  ipcMain.handle(IPC_CHANNELS.CAPTURE_PIN_IMAGE, async (_event, imageBase64: string) => {
    pendingPinImage = imageBase64
    windowManager.createPinWindow(imageBase64)
    windowManager.closeCaptureWindow()
  })

  ipcMain.handle(IPC_CHANNELS.PIN_GET_IMAGE, async () => {
    const data = pendingPinImage
    pendingPinImage = null
    return data
  })

  ipcMain.handle(IPC_CHANNELS.PIN_RESIZE, async (event, width: number, height: number) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win && !win.isDestroyed()) {
      const display = screen.getDisplayMatching(win.getBounds())
      const workArea = display.workArea
      const targetW = Math.min(Math.ceil(width), workArea.width)
      const targetH = Math.min(Math.ceil(height), workArea.height)
      const x = Math.round(workArea.x + (workArea.width - targetW) / 2)
      const y = Math.round(workArea.y + (workArea.height - targetH) / 2)
      win.setBounds({ x, y, width: targetW, height: targetH })
    }
  })

  ipcMain.on(IPC_CHANNELS.PIN_MOVE, (event, deltaX: number, deltaY: number) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win && !win.isDestroyed()) {
      const [x, y] = win.getPosition()
      win.setPosition(x + Math.round(deltaX), y + Math.round(deltaY))
    }
  })

  ipcMain.handle(IPC_CHANNELS.AI_ANALYZE, async (event, params: AIAnalyzeParams) => {
    const selection = lastCaptureResult?.selection

    windowManager.closeCaptureWindow()
    const resultWindow = windowManager.createResultWindow(selection)

    const sendLoading = (): void => {
      resultWindow.webContents.send(IPC_CHANNELS.AI_LOADING, true)
    }
    if (resultWindow.webContents.isLoading()) {
      resultWindow.webContents.once('did-finish-load', sendLoading)
    } else {
      sendLoading()
    }

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
    const selection = lastCaptureResult?.selection

    windowManager.closeCaptureWindow()
    const resultWindow = windowManager.createResultWindow(selection)

    const sendLoading = (): void => {
      resultWindow.webContents.send(IPC_CHANNELS.AI_LOADING, true)
    }
    if (resultWindow.webContents.isLoading()) {
      resultWindow.webContents.once('did-finish-load', sendLoading)
    } else {
      sendLoading()
    }

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
