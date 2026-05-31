import { nativeImage } from 'electron'

export function imageToBase64(buffer: Buffer): string {
  return buffer.toString('base64')
}

export function compressImage(buffer: Buffer, maxWidth: number, maxHeight: number): Buffer {
  const image = nativeImage.createFromBuffer(buffer)
  const size = image.getSize()

  let width = size.width
  let height = size.height

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height)
    width = Math.floor(width * ratio)
    height = Math.floor(height * ratio)
  }

  const resized = image.resize({ width, height })
  return resized.toPNG()
}
