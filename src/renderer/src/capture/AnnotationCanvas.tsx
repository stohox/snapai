import { useRef, useCallback, useEffect, useState } from 'react'
import { useEditorStore } from '../store/editorStore'
import { redrawAll, simplifyPath } from './canvasRenderer'
import type { SelectionArea, Point } from '../../../shared/types'

interface AnnotationCanvasProps {
  selection: SelectionArea
  bgCanvas: HTMLCanvasElement | null
  scaleFactor: number
}

function AnnotationCanvas({ selection, bgCanvas, scaleFactor }: AnnotationCanvasProps): JSX.Element {
  const committedRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef<{
    isDrawing: boolean
    startX: number
    startY: number
    points: Point[]
  }>({ isDrawing: false, startX: 0, startY: 0, points: [] })

  const { tool, color, strokeWidth, fontSize, annotations, addAnnotation, nextSequenceNumber, undo, redo } = useEditorStore()
  const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean; value: string }>({
    x: 0, y: 0, visible: false, value: ''
  })

  const redrawCommitted = useCallback(() => {
    const canvas = committedRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    redrawAll(ctx, annotations, bgCanvas, scaleFactor)
  }, [annotations, bgCanvas])

  useEffect(() => {
    redrawCommitted()
  }, [redrawCommitted])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (textInput.visible) return
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        undo()
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, textInput.visible])

  const getCanvasPos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const canvas = previewRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }, [])

  const commitText = useCallback((): void => {
    setTextInput((prev) => {
      if (prev.visible && prev.value.trim()) {
        addAnnotation({
          type: 'text',
          x: prev.x,
          y: prev.y,
          content: prev.value,
          color,
          fontSize
        })
      }
      return { x: 0, y: 0, visible: false, value: '' }
    })
  }, [color, fontSize, addAnnotation])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent): void => {
      if (textInput.visible) {
        commitText()
        return
      }
      if (tool === 'select') return
      const pos = getCanvasPos(e)

      if (tool === 'text') {
        setTextInput({ x: pos.x, y: pos.y, visible: true, value: '' })
        return
      }

      if (tool === 'number') {
        const num = nextSequenceNumber()
        addAnnotation({
          type: 'number',
          x: pos.x,
          y: pos.y,
          number: num,
          color,
          fontSize
        })
        return
      }

      drawingRef.current = {
        isDrawing: true,
        startX: pos.x,
        startY: pos.y,
        points: [pos]
      }
    },
    [tool, color, fontSize, getCanvasPos, addAnnotation, nextSequenceNumber, textInput.visible, commitText]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent): void => {
      const ref = drawingRef.current
      if (!ref.isDrawing) return
      const pos = getCanvasPos(e)

      const canvas = previewRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (tool === 'pen') {
        ref.points.push(pos)
        ctx.strokeStyle = color
        ctx.lineWidth = strokeWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        const pts = ref.points
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y)
        }
        ctx.stroke()
        return
      }

      const sx = ref.startX
      const sy = ref.startY

      if (tool === 'rect') {
        ctx.strokeStyle = color
        ctx.lineWidth = strokeWidth
        ctx.strokeRect(sx, sy, pos.x - sx, pos.y - sy)
      } else if (tool === 'ellipse') {
        const cx = (sx + pos.x) / 2
        const cy = (sy + pos.y) / 2
        const rx = Math.abs(pos.x - sx) / 2
        const ry = Math.abs(pos.y - sy) / 2
        ctx.strokeStyle = color
        ctx.lineWidth = strokeWidth
        ctx.beginPath()
        ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2)
        ctx.stroke()
      } else if (tool === 'arrow') {
        const headLen = Math.max(10, strokeWidth * 4)
        const angle = Math.atan2(pos.y - sy, pos.x - sx)
        ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.lineWidth = strokeWidth
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x - headLen * Math.cos(angle - Math.PI / 6), pos.y - headLen * Math.sin(angle - Math.PI / 6))
        ctx.lineTo(pos.x - headLen * Math.cos(angle + Math.PI / 6), pos.y - headLen * Math.sin(angle + Math.PI / 6))
        ctx.closePath()
        ctx.fill()
      } else if (tool === 'mosaic') {
        ctx.fillStyle = 'rgba(128,128,128,0.3)'
        ctx.fillRect(Math.min(sx, pos.x), Math.min(sy, pos.y), Math.abs(pos.x - sx), Math.abs(pos.y - sy))
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.strokeRect(Math.min(sx, pos.x), Math.min(sy, pos.y), Math.abs(pos.x - sx), Math.abs(pos.y - sy))
        ctx.setLineDash([])
      }
    },
    [tool, color, strokeWidth, getCanvasPos]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent): void => {
      const ref = drawingRef.current
      if (!ref.isDrawing) return
      const pos = getCanvasPos(e)
      ref.isDrawing = false

      const canvas = previewRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      const sx = ref.startX
      const sy = ref.startY

      if (tool === 'pen') {
        const simplified = simplifyPath(ref.points, 2)
        if (simplified.length >= 2) {
          addAnnotation({
            type: 'pen',
            points: simplified,
            color,
            strokeWidth
          })
        }
      } else if (tool === 'rect') {
        const w = pos.x - sx
        const h = pos.y - sy
        if (Math.abs(w) > 3 && Math.abs(h) > 3) {
          addAnnotation({
            type: 'rect',
            x: Math.min(sx, sx + w),
            y: Math.min(sy, sy + h),
            width: Math.abs(w),
            height: Math.abs(h),
            color,
            strokeWidth
          })
        }
      } else if (tool === 'ellipse') {
        const w = pos.x - sx
        const h = pos.y - sy
        if (Math.abs(w) > 3 && Math.abs(h) > 3) {
          addAnnotation({
            type: 'ellipse',
            cx: (sx + pos.x) / 2,
            cy: (sy + pos.y) / 2,
            rx: Math.abs(w) / 2,
            ry: Math.abs(h) / 2,
            color,
            strokeWidth
          })
        }
      } else if (tool === 'arrow') {
        const dist = Math.hypot(pos.x - sx, pos.y - sy)
        if (dist > 5) {
          addAnnotation({
            type: 'arrow',
            x1: sx,
            y1: sy,
            x2: pos.x,
            y2: pos.y,
            color,
            strokeWidth
          })
        }
      } else if (tool === 'mosaic') {
        const w = pos.x - sx
        const h = pos.y - sy
        if (Math.abs(w) > 3 && Math.abs(h) > 3) {
          addAnnotation({
            type: 'mosaic',
            x: Math.min(sx, sx + w),
            y: Math.min(sy, sy + h),
            width: Math.abs(w),
            height: Math.abs(h),
            blockSize: Math.max(4, strokeWidth * 3)
          })
        }
      }
    },
    [tool, color, strokeWidth, getCanvasPos, addAnnotation]
  )

  const cursorClass = (() => {
    switch (tool) {
      case 'select': return 'cursor-default'
      case 'pen': return 'cursor-crosshair'
      case 'text': return 'cursor-text'
      case 'mosaic': return 'cursor-crosshair'
      default: return 'cursor-crosshair'
    }
  })()

  return (
    <div
      className={`absolute inset-0 ${cursorClass}`}
      style={{ pointerEvents: tool === 'select' && !textInput.visible ? 'none' : 'auto' }}
    >
      <canvas
        ref={committedRef}
        width={selection.width}
        height={selection.height}
        className="absolute inset-0 pointer-events-none"
        style={{ width: selection.width, height: selection.height }}
      />
      <canvas
        ref={previewRef}
        width={selection.width}
        height={selection.height}
        className="absolute inset-0"
        style={{ width: selection.width, height: selection.height }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {textInput.visible && (
        <textarea
          autoFocus
          value={textInput.value}
          onChange={(e) => setTextInput((prev) => ({ ...prev, value: e.target.value }))}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              commitText()
            }
            if (e.key === 'Escape') {
              setTextInput({ x: 0, y: 0, visible: false, value: '' })
            }
          }}
          className="absolute bg-transparent border-2 border-blue-400 outline-none resize-none z-50"
          style={{
            left: textInput.x,
            top: textInput.y,
            color,
            fontSize: `${fontSize}px`,
            fontFamily: 'Arial',
            minWidth: 120,
            minHeight: fontSize * 1.5,
            caretColor: color
          }}
        />
      )}
    </div>
  )
}

export default AnnotationCanvas
