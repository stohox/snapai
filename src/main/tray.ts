import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'
import type { WindowManager } from './window-manager'

export function createTray(windowManager: WindowManager): Tray {
  let icon: Electron.NativeImage
  try {
    const iconPath = app.isPackaged
      ? join(process.resourcesPath, 'icon.ico')
      : join(__dirname, '../../build/icon.ico')
    icon = nativeImage.createFromPath(iconPath)
    if (icon.isEmpty()) {
      const pngPath = app.isPackaged
        ? join(process.resourcesPath, 'icon-32.png')
        : join(__dirname, '../../build/icon-32.png')
      icon = nativeImage.createFromPath(pngPath)
    }
    if (icon.isEmpty()) {
      icon = nativeImage.createEmpty()
    }
  } catch {
    icon = nativeImage.createEmpty()
  }

  const tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '截图',
      click: () => {
        windowManager.createCaptureWindow()
      }
    },
    { type: 'separator' },
    {
      label: '设置',
      click: () => {
        windowManager.createSettingsWindow()
      }
    },
    {
      label: '关于',
      click: () => {
        windowManager.createAboutWindow()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('SnapAI - 智能截图工具')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    windowManager.createCaptureWindow()
  })

  return tray
}
