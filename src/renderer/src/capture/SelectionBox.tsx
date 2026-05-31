import { useRef, useCallback } from 'react'
import type { SelectionArea } from '../../../shared/types'

interface SelectionBoxProps {
  selection: SelectionArea
  onSelectionChange: (selection: SelectionArea) => void
}

type HandlePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'

const MIN_SIZE = 10

function clampSelection(sel: SelectionArea, maxWidth: number, maxHeight: number): SelectionArea {
  let { x, y, width, height } = sel

  width = Math.max(width, MIN_SIZE)
  height = Math.max(height, MIN_SIZE)

  if (x < 0) {
    x = 0
  }
  if (y < 0) {
    y = 0
  }
  if (x + width > maxWidth) {
    x = maxWidth - width
  }
  if (y + height > maxHeight) {
    y = maxHeight - height
  }
  if (x < 0) {
    x = 0
    width = maxWidth
  }
  if (y < 0) {
    y = 0
    height = maxHeight
  }

  return { x, y, width, height }
}

function SelectionBox({ selection, onSelectionChange }: SelectionBoxProps): JSX.Element {
  const dragRef = useRef<{
    type: 'move' | 'resize'
    handle?: HandlePosition
    startX: number
    startY: number
    startSelection: SelectionArea
  } | null>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: 'move' | 'resize', handle?: HandlePosition): void => {
      e.stopPropagation()
      dragRef.current = {
        type,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startSelection: { ...selection }
      }

      const handleMouseMove = (moveEvent: MouseEvent): void => {
        if (!dragRef.current) return

        const dx = moveEvent.clientX - dragRef.current.startX
        const dy = moveEvent.clientY - dragRef.current.startY
        const start = dragRef.current.startSelection
        const maxW = window.innerWidth
        const maxH = window.innerHeight

        if (dragRef.current.type === 'move') {
          const newSel = clampSelection(
            {
              x: start.x + dx,
              y: start.y + dy,
              width: start.width,
              height: start.height
            },
            maxW,
            maxH
          )
          onSelectionChange(newSel)
        } else if (dragRef.current.handle) {
          let newX = start.x
          let newY = start.y
          let newW = start.width
          let newH = start.height

          const h = dragRef.current.handle
          if (h.includes('left')) {
            newX = start.x + dx
            newW = start.width - dx
          }
          if (h.includes('right')) {
            newW = start.width + dx
          }
          if (h.includes('top')) {
            newY = start.y + dy
            newH = start.height - dy
          }
          if (h.includes('bottom')) {
            newH = start.height + dy
          }

          if (newW >= MIN_SIZE && newH >= MIN_SIZE) {
            const newSel = clampSelection(
              { x: newX, y: newY, width: newW, height: newH },
              maxW,
              maxH
            )
            onSelectionChange(newSel)
          }
        }
      }

      const handleMouseUp = (): void => {
        dragRef.current = null
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [selection, onSelectionChange]
  )

  const handles: { position: HandlePosition; className: string; style: React.CSSProperties }[] = [
    {
      position: 'top-left',
      className: 'cursor-nw-resize',
      style: { top: -4, left: -4 }
    },
    {
      position: 'top-right',
      className: 'cursor-ne-resize',
      style: { top: -4, right: -4 }
    },
    {
      position: 'bottom-left',
      className: 'cursor-sw-resize',
      style: { bottom: -4, left: -4 }
    },
    {
      position: 'bottom-right',
      className: 'cursor-se-resize',
      style: { bottom: -4, right: -4 }
    },
    {
      position: 'top',
      className: 'cursor-n-resize',
      style: { top: -4, left: '50%', transform: 'translateX(-50%)' }
    },
    {
      position: 'bottom',
      className: 'cursor-s-resize',
      style: { bottom: -4, left: '50%', transform: 'translateX(-50%)' }
    },
    {
      position: 'left',
      className: 'cursor-w-resize',
      style: { top: '50%', left: -4, transform: 'translateY(-50%)' }
    },
    {
      position: 'right',
      className: 'cursor-e-resize',
      style: { top: '50%', right: -4, transform: 'translateY(-50%)' }
    }
  ]

  return (
    <div
      className="absolute inset-0 border-2 border-blue-500"
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      <div className="absolute -top-6 left-0 text-xs text-white bg-blue-500 px-1.5 py-0.5 rounded">
        {Math.round(selection.width)} × {Math.round(selection.height)}
      </div>

      {handles.map(({ position, className, style }) => (
        <div
          key={position}
          className={`absolute w-2.5 h-2.5 bg-white border border-blue-500 ${className}`}
          style={style}
          onMouseDown={(e) => handleMouseDown(e, 'resize', position)}
        />
      ))}
    </div>
  )
}

export default SelectionBox
