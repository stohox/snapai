import type { Annotation, Point } from '../../../shared/types'

function drawRect(ctx: CanvasRenderingContext2D, ann: Annotation): void {
  if (ann.type !== 'rect') return
  ctx.strokeStyle = ann.color
  ctx.lineWidth = ann.strokeWidth
  ctx.strokeRect(ann.x, ann.y, ann.width, ann.height)
}

function drawEllipse(ctx: CanvasRenderingContext2D, ann: Annotation): void {
  if (ann.type !== 'ellipse') return
  ctx.strokeStyle = ann.color
  ctx.lineWidth = ann.strokeWidth
  ctx.beginPath()
  ctx.ellipse(ann.cx, ann.cy, Math.max(1, ann.rx), Math.max(1, ann.ry), 0, 0, Math.PI * 2)
  ctx.stroke()
}

function drawArrow(ctx: CanvasRenderingContext2D, ann: Annotation): void {
  if (ann.type !== 'arrow') return
  const { x1, y1, x2, y2, color, strokeWidth } = ann
  const headLen = Math.max(10, strokeWidth * 4)
  const angle = Math.atan2(y2 - y1, x2 - x1)

  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = strokeWidth
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}

function drawPen(ctx: CanvasRenderingContext2D, ann: Annotation): void {
  if (ann.type !== 'pen' || ann.points.length < 2) return
  ctx.strokeStyle = ann.color
  ctx.lineWidth = ann.strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(ann.points[0].x, ann.points[0].y)
  for (let i = 1; i < ann.points.length; i++) {
    ctx.lineTo(ann.points[i].x, ann.points[i].y)
  }
  ctx.stroke()
}

function drawNumber(ctx: CanvasRenderingContext2D, ann: Annotation): void {
  if (ann.type !== 'number') return
  const text = String(ann.number)
  const radius = ann.fontSize * 0.7

  ctx.fillStyle = ann.color
  ctx.beginPath()
  ctx.arc(ann.x, ann.y, radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${ann.fontSize * 0.8}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, ann.x, ann.y)
}

function drawText(ctx: CanvasRenderingContext2D, ann: Annotation): void {
  if (ann.type !== 'text') return
  ctx.fillStyle = ann.color
  ctx.font = `${ann.fontSize}px Arial`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(ann.content, ann.x, ann.y)
}

function drawMosaic(
  ctx: CanvasRenderingContext2D,
  ann: Annotation,
  bgCanvas?: HTMLCanvasElement | null,
  scaleFactor?: number
): void {
  if (ann.type !== 'mosaic') return
  const { x, y, width, height, blockSize } = ann

  if (bgCanvas) {
    const sf = scaleFactor ?? 1
    const bgCtx = bgCanvas.getContext('2d')
    if (bgCtx) {
      const px = Math.round(x * sf)
      const py = Math.round(y * sf)
      const pw = Math.round(width * sf)
      const ph = Math.round(height * sf)

      const clampedPw = Math.max(1, Math.min(pw, bgCanvas.width - px))
      const clampedPh = Math.max(1, Math.min(ph, bgCanvas.height - py))

      if (clampedPw <= 0 || clampedPh <= 0) return

      const imageData = bgCtx.getImageData(px, py, clampedPw, clampedPh)
      const data = imageData.data
      const bs = Math.max(2, Math.round(blockSize * sf))

      for (let by = 0; by < clampedPh; by += bs) {
        for (let bx = 0; bx < clampedPw; bx += bs) {
          let r = 0, g = 0, b = 0, count = 0
          for (let dy = 0; dy < bs && by + dy < clampedPh; dy++) {
            for (let dx = 0; dx < bs && bx + dx < clampedPw; dx++) {
              const idx = ((by + dy) * clampedPw + (bx + dx)) * 4
              r += data[idx]
              g += data[idx + 1]
              b += data[idx + 2]
              count++
            }
          }
          r = Math.round(r / count)
          g = Math.round(g / count)
          b = Math.round(b / count)

          ctx.fillStyle = `rgb(${r},${g},${b})`
          ctx.fillRect(x + bx / sf, y + by / sf, Math.min(bs / sf, width - bx / sf), Math.min(bs / sf, height - by / sf))
        }
      }
    }
  } else {
    ctx.fillStyle = '#888888'
    ctx.fillRect(x, y, width, height)
  }
}

export function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  ann: Annotation,
  bgCanvas?: HTMLCanvasElement | null,
  scaleFactor?: number
): void {
  switch (ann.type) {
    case 'rect':
      drawRect(ctx, ann)
      break
    case 'ellipse':
      drawEllipse(ctx, ann)
      break
    case 'arrow':
      drawArrow(ctx, ann)
      break
    case 'pen':
      drawPen(ctx, ann)
      break
    case 'number':
      drawNumber(ctx, ann)
      break
    case 'text':
      drawText(ctx, ann)
      break
    case 'mosaic':
      drawMosaic(ctx, ann, bgCanvas, scaleFactor)
      break
  }
}

export function redrawAll(
  ctx: CanvasRenderingContext2D,
  annotations: Annotation[],
  bgCanvas?: HTMLCanvasElement | null,
  scaleFactor?: number
): void {
  for (const ann of annotations) {
    drawAnnotation(ctx, ann, bgCanvas, scaleFactor)
  }
}

export function simplifyPath(points: Point[], tolerance: number = 2): Point[] {
  if (points.length <= 2) return points

  let maxDist = 0
  let maxIdx = 0
  const first = points[0]
  const last = points[points.length - 1]

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDist(points[i], first, last)
    if (dist > maxDist) {
      maxDist = dist
      maxIdx = i
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyPath(points.slice(0, maxIdx + 1), tolerance)
    const right = simplifyPath(points.slice(maxIdx), tolerance)
    return left.slice(0, -1).concat(right)
  }

  return [first, last]
}

function perpendicularDist(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(point.x - lineStart.x, point.y - lineStart.y)

  const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lenSq))
  const projX = lineStart.x + t * dx
  const projY = lineStart.y + t * dy
  return Math.hypot(point.x - projX, point.y - projY)
}
