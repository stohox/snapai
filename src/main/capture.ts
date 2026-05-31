import { desktopCapturer, screen, clipboard, nativeImage } from 'electron'
import type { DisplayScreenshot, ScreenshotResult } from '../shared/types'

async function captureWithDesktopCapturer(): Promise<ScreenshotResult> {
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

  const totalWidth = maxX - minX
  const totalHeight = maxY - minY

  const maxScaleFactor = Math.max(...displays.map((d) => d.scaleFactor))
  const thumbnailWidth = Math.ceil(totalWidth * maxScaleFactor)
  const thumbnailHeight = Math.ceil(totalHeight * maxScaleFactor)

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: Math.min(thumbnailWidth, 5120),
      height: Math.min(thumbnailHeight, 2880)
    }
  })

  const displayScreenshots: DisplayScreenshot[] = []

  for (let i = 0; i < displays.length; i++) {
    const display = displays[i]
    let source = sources.find((s) => s.display_id === display.id.toString())

    if (!source && sources.length === displays.length) {
      source = sources[i]
    }

    if (source) {
      const thumbnail = source.thumbnail
      if (!thumbnail.isEmpty()) {
        displayScreenshots.push({
          imageDataUrl: thumbnail.toDataURL(),
          x: display.bounds.x - minX,
          y: display.bounds.y - minY,
          width: display.bounds.width,
          height: display.bounds.height
        })
      }
    }
  }

  if (displayScreenshots.length === 0) {
    throw new Error('未能捕获任何屏幕')
  }

  return {
    displays: displayScreenshots,
    totalBounds: { x: minX, y: minY, width: totalWidth, height: totalHeight }
  }
}

function captureFromClipboard(): ScreenshotResult {
  const image = clipboard.readImage()
  if (image.isEmpty()) {
    throw new Error('无法捕获屏幕，请检查权限设置')
  }
  const size = image.getSize()
  return {
    displays: [
      {
        imageDataUrl: image.toDataURL(),
        x: 0,
        y: 0,
        width: size.width,
        height: size.height
      }
    ],
    totalBounds: { x: 0, y: 0, width: size.width, height: size.height }
  }
}

export async function captureScreen(): Promise<ScreenshotResult> {
  try {
    return await captureWithDesktopCapturer()
  } catch (error) {
    console.error('desktopCapturer failed:', error)
    return captureFromClipboard()
  }
}

export function nativeImageFromBase64(base64: string): Electron.NativeImage {
  return nativeImage.createFromDataURL(`data:image/png;base64,${base64}`)
}
