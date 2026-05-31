import { app, BrowserWindow, globalShortcut } from 'electron'
import { join } from 'path'
import { createTray } from './tray'
import { registerScreenshotShortcut } from './shortcut'
import { WindowManager } from './window-manager'
import { registerIpcHandlers } from './ipc-handlers'
import { captureScreen } from './capture'
import { DEFAULT_SHORTCUT_KEY } from '../shared/constants'
import { IPC_CHANNELS } from '../shared/types'

let tray: Electron.Tray | null = null
const windowManager = new WindowManager()

async function startScreenshotCapture(): Promise<void> {
  try {
    const screenshotResult = await captureScreen()
    const captureWindow = windowManager.createCaptureWindow()
    captureWindow.webContents.once('did-finish-load', () => {
      windowManager.sendToCaptureWindow(IPC_CHANNELS.CAPTURE_SCREENSHOT, screenshotResult)
    })
  } catch (error) {
    console.error('Failed to capture screen:', error)
  }
}

app.whenReady().then(() => {
  registerIpcHandlers(windowManager)

  tray = createTray(windowManager)

  registerScreenshotShortcut(DEFAULT_SHORTCUT_KEY, () => {
    startScreenshotCapture()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createSettingsWindow()
    }
  })
})

app.on('window-all-closed', () => {
})

app.on('before-quit', () => {
  globalShortcut.unregisterAll()
})
