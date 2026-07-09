import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ensureHomeTrailingSlash } from '../lib/appBase'

/** Keeps the deployed home URL at `/whos-with-who/` (with trailing slash). */
export default function EnsureHomeTrailingSlash() {
  const { pathname } = useLocation()

  useEffect(() => {
    ensureHomeTrailingSlash()
  }, [pathname])

  return null
}
