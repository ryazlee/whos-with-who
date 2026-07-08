export type BlurRegion = {
  x: number
  y: number
  radius: number
}

export type BlurCanvasLayout = {
  width: number
  height: number
  scale: number
}

/** Fit image inside max bounds; returns layout for mapping display coords → canvas coords. */
export function computeImageLayout(
  imageWidth: number,
  imageHeight: number,
  maxWidth: number,
  maxHeight: number,
): BlurCanvasLayout {
  const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight, 1)
  return {
    width: Math.round(imageWidth * scale),
    height: Math.round(imageHeight * scale),
    scale,
  }
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load image'))
    }
    img.src = url
  })
}

export function drawImageToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  layout: BlurCanvasLayout,
) {
  canvas.width = layout.width
  canvas.height = layout.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.clearRect(0, 0, layout.width, layout.height)
  ctx.drawImage(image, 0, 0, layout.width, layout.height)
}

/** Apply a circular Gaussian-style blur at canvas coordinates. */
export function applyBlurSpot(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  region: BlurRegion,
  blurPx = 16,
) {
  const { x, y, radius } = region
  const size = Math.ceil(radius * 2)
  const sx = Math.max(0, Math.floor(x - radius))
  const sy = Math.max(0, Math.floor(y - radius))
  const sw = Math.min(size, canvas.width - sx)
  const sh = Math.min(size, canvas.height - sy)
  if (sw <= 0 || sh <= 0) return

  const patch = document.createElement('canvas')
  patch.width = sw
  patch.height = sh
  const patchCtx = patch.getContext('2d')
  if (!patchCtx) return

  patchCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh)

  const blurred = document.createElement('canvas')
  blurred.width = sw
  blurred.height = sh
  const blurredCtx = blurred.getContext('2d')
  if (!blurredCtx) return
  blurredCtx.filter = `blur(${blurPx}px)`
  blurredCtx.drawImage(patch, 0, 0)

  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(blurred, sx, sy)
  ctx.restore()
}

export function applyAllBlurRegions(
  baseCanvas: HTMLCanvasElement,
  image: HTMLImageElement,
  layout: BlurCanvasLayout,
  regions: BlurRegion[],
) {
  const ctx = baseCanvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  drawImageToCanvas(baseCanvas, image, layout)
  for (const region of regions) {
    applyBlurSpot(ctx, baseCanvas, region)
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))),
      type,
      quality,
    )
  })
}

export function canvasToDataUrl(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.92): string {
  return canvas.toDataURL(type, quality)
}

/** Map pointer position on displayed canvas element to internal canvas pixels. */
export function pointerToCanvasCoords(
  canvasEl: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = canvasEl.getBoundingClientRect()
  const scaleX = canvasEl.width / rect.width
  const scaleY = canvasEl.height / rect.height
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}
