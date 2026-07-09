import { loadImageFromDataUrl } from './imageBlur'

export const CROP_VIEWPORT_SIZE = 300
export const CROP_OUTPUT_SIZE = 512

export type CropTransform = {
  scale: number
  offsetX: number
  offsetY: number
}

export { loadImageFromDataUrl }

export function minCoverScale(imageWidth: number, imageHeight: number, viewport: number): number {
  return Math.max(viewport / imageWidth, viewport / imageHeight)
}

export function initialCropTransform(
  imageWidth: number,
  imageHeight: number,
  viewport = CROP_VIEWPORT_SIZE,
): CropTransform {
  const scale = minCoverScale(imageWidth, imageHeight, viewport)
  return {
    scale,
    offsetX: (viewport - imageWidth * scale) / 2,
    offsetY: (viewport - imageHeight * scale) / 2,
  }
}

export function clampCropTransform(
  transform: CropTransform,
  imageWidth: number,
  imageHeight: number,
  viewport = CROP_VIEWPORT_SIZE,
): CropTransform {
  const displayW = imageWidth * transform.scale
  const displayH = imageHeight * transform.scale

  const minX = Math.min(0, viewport - displayW)
  const minY = Math.min(0, viewport - displayH)
  const maxX = 0
  const maxY = 0

  return {
    scale: transform.scale,
    offsetX: Math.min(maxX, Math.max(minX, transform.offsetX)),
    offsetY: Math.min(maxY, Math.max(minY, transform.offsetY)),
  }
}

export function cropImageToDataUrl(
  image: HTMLImageElement,
  transform: CropTransform,
  viewport = CROP_VIEWPORT_SIZE,
  outputSize = CROP_OUTPUT_SIZE,
): string {
  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  const sourceSize = viewport / transform.scale
  const sourceX = -transform.offsetX / transform.scale
  const sourceY = -transform.offsetY / transform.scale

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    outputSize,
    outputSize,
  )

  return canvas.toDataURL('image/jpeg', 0.92)
}
