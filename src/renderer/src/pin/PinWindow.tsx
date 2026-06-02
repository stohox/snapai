import { useState, useEffect, useRef, useCallback } from 'react'

function PinWindow(): JSX.Element {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [scale, setScale] = useState(1)
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dragRef = useRef<{ isDragging: boolean; lastX: number; lastY: number }>({
    isDragging: false, lastX: 0, lastY: 0
  })

  useEffect(() => {
    const loadImage = async (): Promise<void> => {
      try {
        const data = await window.electronAPI.pin.getImage()
        if (data) {
          setImageSrc(`data:image/png;base64,${data}`)
        } else {
          setError('未找到图片数据')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载图片失败')
      } finally {
        setIsLoading(false)
      }
    }
    loadImage()
  }, [])

  useEffect(() => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const maxW = window.screen.availWidth * 0.6
      const maxH = window.screen.availHeight * 0.6
      const initialScale = Math.min(1, maxW / w, maxH / h)
      const displayW = Math.ceil(w * initialScale)
      const displayH = Math.ceil(h * initialScale) + 24
      setScale(initialScale)
      setImgSize({ width: w, height: h })
      window.electronAPI.pin.resize(displayW, displayH).catch(() => {})
    }
    img.src = imageSrc
  }, [imageSrc])

  useEffect(() => {
    if (!imgSize.width || !imgSize.height) return
    const displayW = Math.ceil(imgSize.width * scale)
    const displayH = Math.ceil(imgSize.height * scale) + 24
    window.electronAPI.pin.resize(displayW, displayH).catch(() => {})
  }, [scale, imgSize])

  const handleWheel = useCallback((e: React.WheelEvent): void => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale((prev) => Math.max(0.1, Math.min(5, prev * delta)))
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent): void => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      isDragging: true,
      lastX: e.screenX,
      lastY: e.screenY
    }
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent): void => {
    if (!dragRef.current.isDragging) return
    const deltaX = e.screenX - dragRef.current.lastX
    const deltaY = e.screenY - dragRef.current.lastY
    dragRef.current.lastX = e.screenX
    dragRef.current.lastY = e.screenY
    if (deltaX !== 0 || deltaY !== 0) {
      window.electronAPI.pin.move(deltaX, deltaY)
    }
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent): void => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {}
    }
  }, [])

  const handleDoubleClick = useCallback((): void => {
    window.close()
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent): void => {
    e.preventDefault()
    window.close()
  }, [])

  if (isLoading) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{ background: 'rgba(40, 40, 40, 0.9)' }}
        onContextMenu={handleContextMenu}
      >
        <div className="text-white text-sm">加载中...</div>
      </div>
    )
  }

  if (error || !imageSrc) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{ background: 'rgba(40, 40, 40, 0.9)' }}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="text-white text-sm">{error || '图片加载失败'}</div>
      </div>
    )
  }

  const displayW = imgSize.width * scale
  const displayH = imgSize.height * scale

  return (
    <div
      className="w-full h-screen select-none flex flex-col"
      style={{ background: 'transparent', cursor: 'grab' }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <img
        src={imageSrc}
        draggable={false}
        className="shadow-2xl rounded-sm"
        style={{
          width: displayW,
          height: displayH,
          pointerEvents: 'none'
        }}
      />
      <div
        className="bg-black/70 text-white text-[10px] px-2 py-0.5 rounded mt-1 self-start pointer-events-none"
      >
        {Math.round(scale * 100)}% · 拖拽移动，滚轮缩放，双击或右键关闭
      </div>
    </div>
  )
}

export default PinWindow
