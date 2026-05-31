import { useState, useRef, useCallback, useEffect } from 'react'
import SelectionBox from './SelectionBox'
import Toolbar from './Toolbar'
import type { SelectionArea, ScreenshotResult } from '../../../shared/types'

interface DragState {
  isDragging: boolean
  startX: number
  startY: number
}

function CaptureOverlay(): JSX.Element {
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string>('')
  const [selection, setSelection] = useState<SelectionArea | null>(null)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0
  })
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribe = window.electronAPI.capture.onScreenshot(
      async (data: ScreenshotResult) => {
        const canvas = document.createElement('canvas')
        canvas.width = data.totalBounds.width
        canvas.height = data.totalBounds.height
        const ctx = canvas.getContext('2d')!

        for (const display of data.displays) {
          const img = new Image()
          await new Promise<void>((resolve) => {
            img.onload = () => resolve()
            img.src = display.imageDataUrl
          })
          ctx.drawImage(img, display.x, display.y, display.width, display.height)
        }

        compositeCanvasRef.current = canvas
        setScreenshotDataUrl(canvas.toDataURL())
      }
    )
    return unsubscribe
  }, [])

  const getCroppedImage = useCallback((): string => {
    if (!compositeCanvasRef.current || !selection) return ''
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(selection.width)
    canvas.height = Math.round(selection.height)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(
      compositeCanvasRef.current,
      selection.x,
      selection.y,
      selection.width,
      selection.height,
      0,
      0,
      selection.width,
      selection.height
    )
    const dataUrl = canvas.toDataURL('image/png')
    return dataUrl.split(',')[1]
  }, [selection])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent): void => {
      if (selection) return
      setDragState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY
      })
    },
    [selection]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent): void => {
      if (!dragState.isDragging) return

      const x = Math.min(dragState.startX, e.clientX)
      const y = Math.min(dragState.startY, e.clientY)
      const width = Math.abs(e.clientX - dragState.startX)
      const height = Math.abs(e.clientY - dragState.startY)

      if (width >= 10 && height >= 10) {
        setSelection({ x, y, width, height })
      }
    },
    [dragState]
  )

  const handleMouseUp = useCallback((): void => {
    setDragState((prev) => ({ ...prev, isDragging: false }))
  }, [])

  const handleSelectionChange = useCallback((newSelection: SelectionArea): void => {
    setSelection(newSelection)
  }, [])

  const handleConfirm = useCallback((): void => {
    const imageBase64 = getCroppedImage()
    if (imageBase64 && selection) {
      window.electronAPI?.capture.copyImage(imageBase64)
    }
  }, [getCroppedImage, selection])

  const handleCancel = useCallback((): void => {
    window.electronAPI?.capture.cancel()
  }, [])

  const handleDoubleClick = useCallback((): void => {
    if (selection) {
      handleConfirm()
    }
  }, [selection, handleConfirm])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        handleCancel()
      } else if (e.key === 'Enter' && selection) {
        handleConfirm()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCancel, handleConfirm, selection])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault()
        handleCancel()
      }}
    >
      {screenshotDataUrl && (
        <img
          src={screenshotDataUrl}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      )}

      {selection && (
        <>
          <div
            className="absolute bg-black/50 pointer-events-none"
            style={{ top: 0, left: 0, right: 0, height: selection.y }}
          />
          <div
            className="absolute bg-black/50 pointer-events-none"
            style={{ top: selection.y, left: 0, width: selection.x, height: selection.height }}
          />
          <div
            className="absolute bg-black/50 pointer-events-none"
            style={{
              top: selection.y,
              left: selection.x + selection.width,
              right: 0,
              height: selection.height
            }}
          />
          <div
            className="absolute bg-black/50 pointer-events-none"
            style={{
              top: selection.y + selection.height,
              left: 0,
              right: 0,
              bottom: 0
            }}
          />

          <div
            className="absolute"
            style={{
              left: selection.x,
              top: selection.y,
              width: selection.width,
              height: selection.height
            }}
            onDoubleClick={handleDoubleClick}
          >
            <SelectionBox selection={selection} onSelectionChange={handleSelectionChange} />
          </div>

          <Toolbar selection={selection} getCroppedImage={getCroppedImage} />
        </>
      )}
    </div>
  )
}

export default CaptureOverlay
