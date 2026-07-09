export const ACCEPTED_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif'

const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export function isAcceptedImageFile(file: File): boolean {
  if (file.type && ACCEPTED_MIME_TYPES.has(file.type)) return true
  return /\.(jpe?g|png|webp|gif)$/i.test(file.name)
}

export function isGifFile(file: File): boolean {
  return file.type === 'image/gif' || /\.gif$/i.test(file.name)
}

export function isGifMime(mime: string): boolean {
  return mime === 'image/gif'
}

export function isGifDataUrl(dataUrl: string): boolean {
  return dataUrl.startsWith('data:image/gif')
}

export function isGifUrl(url: string): boolean {
  return /\.gif(?:$|[?#])/i.test(url) || url.startsWith('data:image/gif')
}

/** Face blur flattens to JPEG — only offer for static images. */
export function supportsFaceBlur(imageRef: string): boolean {
  return !isGifDataUrl(imageRef) && !isGifUrl(imageRef)
}

export function imageExtensionForMime(mime: string): string {
  if (mime.includes('gif')) return 'gif'
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  return 'jpg'
}

export function imageExtensionForDataUrl(dataUrl: string): string {
  const match = /^data:(image\/[a-z0-9.+-]+);/i.exec(dataUrl)
  return imageExtensionForMime(match?.[1] ?? 'image/jpeg')
}
