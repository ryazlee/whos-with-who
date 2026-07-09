import { useEffect, useMemo, useState } from 'react'
import { resolvePersonImageUrl } from './personAvatar'

const cache = new Map<string, string>()
const inflight = new Map<string, Promise<string>>()
const prefetchQueue: string[] = []
const queued = new Set<string>()
let activePrefetches = 0
const MAX_CONCURRENT_PREFETCH = 2

function shouldCache(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

function drainPrefetchQueue() {
  while (activePrefetches < MAX_CONCURRENT_PREFETCH && prefetchQueue.length > 0) {
    const url = prefetchQueue.shift()!
    queued.delete(url)
    if (cache.has(url) || inflight.has(url)) continue

    activePrefetches += 1
    void getCachedImageUrl(url).finally(() => {
      activePrefetches -= 1
      drainPrefetchQueue()
    })
  }
}

function enqueuePrefetch(url: string) {
  if (!shouldCache(url) || cache.has(url) || inflight.has(url) || queued.has(url)) return
  queued.add(url)
  prefetchQueue.push(url)
  drainPrefetchQueue()
}

export function getCachedImageUrl(url: string): Promise<string> {
  if (!shouldCache(url)) return Promise.resolve(url)

  const hit = cache.get(url)
  if (hit) return Promise.resolve(hit)

  const pending = inflight.get(url)
  if (pending) return pending

  const promise = fetch(url, { priority: 'low' } as RequestInit)
    .then((response) => {
      if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`)
      return response.blob()
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob)
      cache.set(url, blobUrl)
      inflight.delete(url)
      return blobUrl
    })
    .catch(() => {
      inflight.delete(url)
      return url
    })

  inflight.set(url, promise)
  return promise
}

export function prefetchPersonImage(imageUrl: string, name = ''): void {
  const resolved = resolvePersonImageUrl(imageUrl, name)
  enqueuePrefetch(resolved)
}

export function prefetchPersonImages(people: Array<{ imageUrl: string; name: string }>): void {
  const schedule = () => {
    for (const person of people) {
      prefetchPersonImage(person.imageUrl, person.name)
    }
  }

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(schedule, { timeout: 2000 })
  } else {
    setTimeout(schedule, 0)
  }
}

export function useCachedPersonImageUrl(imageUrl: string, name = ''): string {
  const resolved = useMemo(() => resolvePersonImageUrl(imageUrl, name), [imageUrl, name])
  const [displayUrl, setDisplayUrl] = useState(resolved)

  useEffect(() => {
    setDisplayUrl(resolved)
    if (!shouldCache(resolved)) return

    let active = true
    void getCachedImageUrl(resolved).then((url) => {
      if (active) setDisplayUrl(url)
    })

    return () => {
      active = false
    }
  }, [resolved])

  return displayUrl
}
