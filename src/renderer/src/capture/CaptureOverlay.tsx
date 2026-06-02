import { useState, useRef, useCallback, useEffect } from 'react'
import SelectionBox from './SelectionBox'
import ToolPanel from './ToolPanel'
import AnnotationCanvas from './AnnotationCanvas'
import { useEditorStore } from '../store/editorStore'
import { redrawAll } from './canvasRenderer'
import type { SelectionArea, ScreenshotResult } from '../../../shared/types'

interface DragState {
  isDragging: boolean
  startX: number
  startY: number
}

type EditorMode = 'select' | 'edit'

function CaptureOverlay(): JSX.Element {
  const [selection, setSelection] = useState<SelectionArea | null>(null)
  const [mode, setMode] = useState<EditorMode>('select')
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0
  })
  const [canvasReady, setCanvasReady] = useState(false)
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const scaleFactorRef = useRef<number>(1)
  const screenSizeRef = useRef({ width: 0, height: 0 })
  const { clearAnnotations } = useEditorStore()

  useEffect(() => {
    const unsubscribe = window.electronAPI.capture.onScreenshot(
      async (data: ScreenshotResult) => {
        const maxScale = Math.max(
          1,
          ...data.displays.map((d) => d.scaleFactor ?? 1)
        )
        scaleFactorRef.current = maxScale
        screenSizeRef.current = { width: data.totalBounds.width, height: data.totalBounds.height }

        const canvas = document.createElement('canvas')
        canvas.width = Math.round(data.totalBounds.width * maxScale)
        canvas.height = Math.round(data.totalBounds.height * maxScale)
        const ctx = canvas.getContext('2d')!

        for (const display of data.displays) {
          const sf = display.scaleFactor ?? 1
          const img = new Image()
          await new Promise<void>((resolve) => {
            img.onload = () => resolve()
            img.src = display.imageDataUrl
          })
          ctx.drawImage(
            img,
            display.x * sf,
            display.y * sf,
            img.naturalWidth,
            img.naturalHeight
          )
        }

        bgCanvasRef.current = canvas
        setCanvasReady(true)
        setMode('select')
        setSelection(null)
        clearAnnotations()
      }
    )
    return unsubscribe
  }, [clearAnnotations])

  useEffect(() => {
    if (canvasReady && bgCanvasRef.current && displayCanvasRef.current) {
      const displayCtx = displayCanvasRef.current.getContext('2d')
      if (displayCtx) {
        displayCanvasRef.current.width = bgCanvasRef.current.width
        displayCanvasRef.current.height = bgCanvasRef.current.height
        displayCtx.drawImage(bgCanvasRef.current, 0, 0)
      }
    }
  }, [canvasReady])

  const getCroppedImage = useCallback((): string => {
    const bgCanvas = bgCanvasRef.current
    if (!bgCanvas || !selection) return ''
    const sf = scaleFactorRef.current

    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = Math.round(selection.width * sf)
    exportCanvas.height = Math.round(selection.height * sf)
    const exportCtx = exportCanvas.getContext('2d')!

    exportCtx.drawImage(
      bgCanvas,
      selection.x * sf,
      selection.y * sf,
      selection.width * sf,
      selection.height * sf,
      0,
      0,
      exportCanvas.width,
      exportCanvas.height
    )

    const { annotations } = useEditorStore.getState()
    if (annotations.length > 0) {
      exportCtx.save()
      exportCtx.scale(sf, sf)
      redrawAll(exportCtx, annotations, bgCanvas, sf)
      exportCtx.restore()
    }

    const dataUrl = exportCanvas.toDataURL('image/png')
    return dataUrl.split(',')[1]
  }, [selection])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent): void => {
      if (mode !== 'select' || selection) return
      setDragState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY
      })
    },
    [mode, selection]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent): void => {
      if (!dragState.isDragging) return

      const x = Math.min(dragState.startX, e.clientX)
      const y = Math.min(dragState.startY, e.clientY)
      const width = Math.abs(e.clientX - dragState.startX)
      const height = Math.abs(e.clientY - dragState.startY)

      if (width >= 5 && height >= 5) {
        setSelection({ x, y, width, height })
      }
    },
    [dragState]
  )

  const handleMouseUp = useCallback((): void => {
    if (dragState.isDragging && selection && selection.width >= 5 && selection.height >= 5) {
      setMode('edit')
    }
    setDragState((prev) => ({ ...prev, isDragging: false }))
  }, [dragState.isDragging, selection])

  const handleSelectionChange = useCallback((newSelection: SelectionArea): void => {
    setSelection(newSelection)
  }, [])

  const handleCancel = useCallback((): void => {
    if (mode === 'edit') {
      setMode('select')
      setSelection(null)
      clearAnnotations()
    } else {
      window.electronAPI?.capture.cancel()
    }
  }, [mode, clearAnnotations])

  const handleDoubleClick = useCallback((): void => {
    if (selection && mode === 'select') {
      setMode('edit')
    }
  }, [selection, mode])

  const handlePinImage = useCallback((imageBase64: string): void => {
    window.electronAPI?.capture.pinImage(imageBase64)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        handleCancel()
      } else if (e.key === 'Enter' && selection && mode === 'select') {
        setMode('edit')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCancel, selection, mode])

  const cursorClass = mode === 'select' && !selection ? 'cursor-crosshair' : 'cursor-default'
  const sf = scaleFactorRef.current
  const screenW = screenSizeRef.current.width
  const screenH = screenSizeRef.current.height

  return (
    <div
      className={`fixed inset-0 ${cursorClass}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault()
        handleCancel()
      }}
    >
      {canvasReady && bgCanvasRef.current && (
        <canvas
          ref={displayCanvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: screenW, height: screenH }}
        />
      )}

      {selection && (
        <>
          <div
            className="absolute pointer-events-none"
            style={{
              top: 0, left: 0, right: 0,
              height: selection.y,
              backgroundColor: mode === 'edit' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)'
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: selection.y, left: 0,
              width: selection.x, height: selection.height,
              backgroundColor: mode === 'edit' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)'
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: selection.y,
              left: selection.x + selection.width,
              right: 0, height: selection.height,
              backgroundColor: mode === 'edit' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)'
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: selection.y + selection.height,
              left: 0, right: 0, bottom: 0,
              backgroundColor: mode === 'edit' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)'
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
            {mode === 'select' && (
              <SelectionBox selection={selection} onSelectionChange={handleSelectionChange} />
            )}

            {mode === 'edit' && (
              <AnnotationCanvas
                selection={selection}
                bgCanvas={bgCanvasRef.current}
                scaleFactor={sf}
              />
            )}
          </div>

          {mode === 'edit' && (
            <ToolPanel
              selection={selection}
              getCroppedImage={getCroppedImage}
              onPinImage={handlePinImage}
            />
          )}
        </>
      )}
    </div>
  )
}

export default CaptureOverlay
