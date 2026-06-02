import { app, BrowserWindow, globalShortcut, dialog } from 'electron'
import { join } from 'path'
import { createTray } from './tray'
import { registerScreenshotShortcut } from './shortcut'
import { WindowManager } from './window-manager'
import { registerIpcHandlers } from './ipc-handlers'
import { captureScreen } from './capture'
import { DEFAULT_SHORTCUT_KEY } from '../shared/constants'
import { IPC_CHANNELS } from '../shared/types'

process.on('uncaughtException', (error) => {
  const message = error instanceof Error ? `${error.message}\n${error.stack}` : String(error)
  dialog.showErrorBox('SnapAI Error', message)
})

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

let tray: Electron.Tray | null = null
const windowManager = new WindowManager()

async function startScreenshotCapture(): Promise<void> {
  try {
    const screenshotResult = await captureScreen()
    const captureWindow = windowManager.createCaptureWindow()
    const sendData = (): void => {
      captureWindow.webContents.send(IPC_CHANNELS.CAPTURE_SCREENSHOT, screenshotResult)
    }
    if (captureWindow.webContents.isLoading()) {
      captureWindow.webContents.once('did-finish-load', sendData)
    } else {
      sendData()
    }
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

  windowManager.createSettingsWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createSettingsWindow()
    }
  })
})

app.on('second-instance', () => {
  windowManager.createSettingsWindow()
})

app.on('window-all-closed', () => {
})

app.on('before-quit', () => {
  globalShortcut.unregisterAll()
})
