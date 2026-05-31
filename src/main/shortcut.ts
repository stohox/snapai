import { globalShortcut } from 'electron'

export function registerScreenshotShortcut(accelerator: string, callback: () => void): boolean {
  if (globalShortcut.isRegistered(accelerator)) {
    globalShortcut.unregister(accelerator)
  }
  return globalShortcut.register(accelerator, callback)
}

export function unregisterScreenshotShortcut(accelerator: string): void {
  if (globalShortcut.isRegistered(accelerator)) {
    globalShortcut.unregister(accelerator)
  }
}

export function isShortcutRegistered(accelerator: string): boolean {
  return globalShortcut.isRegistered(accelerator)
}
