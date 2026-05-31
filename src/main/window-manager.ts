import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import type { SelectionArea } from '../shared/types'

export class WindowManager {
  private captureWindow: BrowserWindow | null = null
  private resultWindow: BrowserWindow | null = null
  private settingsWindow: BrowserWindow | null = null
  private aboutWindow: BrowserWindow | null = null

  private getPreloadPath(): string {
    return join(__dirname, '../preload/index.js')
  }

  private loadWindowContent(window: BrowserWindow, route: string): void {
    if (process.env['ELECTRON_RENDERER_URL']) {
      window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/${route}`)
    } else {
      window.loadFile(join(__dirname, '../renderer/index.html'), {
        hash: `/${route}`
      })
    }
  }

  private getUnionDisplayBounds(): { x: number; y: number; width: number; height: number } {
    const displays = screen.getAllDisplays()
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const display of displays) {
      minX = Math.min(minX, display.bounds.x)
      minY = Math.min(minY, display.bounds.y)
      maxX = Math.max(maxX, display.bounds.x + display.bounds.width)
      maxY = Math.max(maxY, display.bounds.y + display.bounds.height)
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  createCaptureWindow(): BrowserWindow {
    if (this.captureWindow && !this.captureWindow.isDestroyed()) {
      this.captureWindow.show()
      return this.captureWindow
    }

    const bounds = this.getUnionDisplayBounds()

    this.captureWindow = new BrowserWindow({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      hasShadow: false,
      webPreferences: {
        preload: this.getPreloadPath(),
        sandbox: false
      }
    })

    this.loadWindowContent(this.captureWindow, 'capture')

    this.captureWindow.on('closed', () => {
      this.captureWindow = null
    })

    return this.captureWindow
  }

  createResultWindow(selection?: SelectionArea): BrowserWindow {
    if (this.resultWindow && !this.resultWindow.isDestroyed()) {
      this.resultWindow.show()
      if (selection) {
        this.positionResultWindow(selection)
      }
      return this.resultWindow
    }

    this.resultWindow = new BrowserWindow({
      width: 480,
      height: 400,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: true,
      webPreferences: {
        preload: this.getPreloadPath(),
        sandbox: false
      }
    })

    this.loadWindowContent(this.resultWindow, 'result')

    if (selection) {
      this.resultWindow.once('ready-to-show', () => {
        this.positionResultWindow(selection)
      })
    }

    this.resultWindow.on('closed', () => {
      this.resultWindow = null
    })

    return this.resultWindow
  }

  positionResultWindow(selection: SelectionArea): void {
    if (!this.resultWindow || this.resultWindow.isDestroyed()) return

    const resultWidth = 480
    const resultHeight = 400
    const displays = screen.getAllDisplays()
    const primaryDisplay = displays.find((d) => d.bounds.x === 0 && d.bounds.y === 0) || displays[0]
    const workArea = primaryDisplay.workArea

    let x = selection.x + selection.width + 10
    let y = selection.y

    if (x + resultWidth > workArea.x + workArea.width) {
      x = selection.x
      y = selection.y + selection.height + 10
    }

    if (y + resultHeight > workArea.y + workArea.height) {
      y = workArea.y + workArea.height - resultHeight
    }

    if (x < workArea.x) {
      x = workArea.x
    }

    if (y < workArea.y) {
      y = workArea.y
    }

    this.resultWindow.setBounds({ x, y, width: resultWidth, height: resultHeight })
  }

  createSettingsWindow(): BrowserWindow {
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.show()
      this.settingsWindow.focus()
      return this.settingsWindow
    }

    this.settingsWindow = new BrowserWindow({
      width: 600,
      height: 500,
      frame: true,
      transparent: false,
      alwaysOnTop: false,
      resizable: false,
      title: 'SnapAI 设置',
      webPreferences: {
        preload: this.getPreloadPath(),
        sandbox: false
      }
    })

    this.loadWindowContent(this.settingsWindow, 'settings')

    this.settingsWindow.on('closed', () => {
      this.settingsWindow = null
    })

    return this.settingsWindow
  }

  createAboutWindow(): BrowserWindow {
    if (this.aboutWindow && !this.aboutWindow.isDestroyed()) {
      this.aboutWindow.show()
      this.aboutWindow.focus()
      return this.aboutWindow
    }

    this.aboutWindow = new BrowserWindow({
      width: 360,
      height: 280,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      webPreferences: {
        preload: this.getPreloadPath(),
        sandbox: false
      }
    })

    this.loadWindowContent(this.aboutWindow, 'about')

    this.aboutWindow.on('closed', () => {
      this.aboutWindow = null
    })

    return this.aboutWindow
  }

  closeCaptureWindow(): void {
    if (this.captureWindow && !this.captureWindow.isDestroyed()) {
      this.captureWindow.close()
    }
  }

  closeResultWindow(): void {
    if (this.resultWindow && !this.resultWindow.isDestroyed()) {
      this.resultWindow.close()
    }
  }

  sendToCaptureWindow(channel: string, ...args: unknown[]): void {
    if (this.captureWindow && !this.captureWindow.isDestroyed()) {
      this.captureWindow.webContents.send(channel, ...args)
    }
  }

  sendToResultWindow(channel: string, ...args: unknown[]): void {
    if (this.resultWindow && !this.resultWindow.isDestroyed()) {
      this.resultWindow.webContents.send(channel, ...args)
    }
  }

  getCaptureWindow(): BrowserWindow | null {
    return this.captureWindow
  }

  getResultWindow(): BrowserWindow | null {
    return this.resultWindow
  }
}
