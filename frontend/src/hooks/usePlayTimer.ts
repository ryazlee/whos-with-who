import { useCallback, useEffect, useRef } from 'react'

/** Tracks elapsed play time from when the game becomes interactive. */
export function usePlayTimer(gameId: string, active: boolean) {
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      startRef.current = null
      return
    }
    startRef.current = Date.now()
  }, [gameId, active])

  return useCallback(() => {
    if (!startRef.current) return 0
    return Math.max(0, Date.now() - startRef.current)
  }, [])
}
