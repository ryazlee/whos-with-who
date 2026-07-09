export type DrawLinesLayout = {
  height: number
  cx: number
  cy: number
  radius: number
  avatarSize: number
  hitRadius: number
  showName: boolean
  lineStroke: number
}

/** Circle layout + avatar size inversely scaled to headcount. */
export function computeDrawLinesLayout(peopleCount: number, width: number): DrawLinesLayout {
  const count = Math.max(peopleCount, 1)
  const height = Math.max(
    280,
    Math.min(count <= 6 ? 420 : count <= 10 ? 460 : 500, width * (count <= 6 ? 0.95 : 1.02)),
  )
  const cx = width / 2
  const cy = height / 2
  const radiusFactor = count <= 4 ? 0.34 : count <= 8 ? 0.38 : 0.41
  const radius = Math.min(width, height) * radiusFactor
  const slot = (2 * Math.PI * radius) / count
  const avatarSize = Math.round(Math.min(72, Math.max(30, slot * 0.5)))
  const hitRadius = avatarSize * 0.58

  return {
    height,
    cx,
    cy,
    radius,
    avatarSize,
    hitRadius,
    showName: count <= 9,
    lineStroke: Math.max(2, Math.round(avatarSize / 22)),
  }
}
