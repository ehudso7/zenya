/**
 * CDN Script Loader Component
 * Loads external scripts with integrity checking and error handling
 */

'use client'

import { useEffect, useState } from 'react'
import { getCDNUrl } from '@/lib/cdn/config'

interface CDNScriptLoaderProps {
  src: string
  integrity?: string
  async?: boolean
  defer?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
  fallbackSrc?: string
}

export function CDNScriptLoader({
  src,
  integrity,
  async = true,
  defer = false,
  onLoad,
  onError,
  fallbackSrc,
}: CDNScriptLoaderProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const script = document.createElement('script')
    const cdnUrl = getCDNUrl(src)
    
    script.src = cdnUrl
    script.async = async
    script.defer = defer
    
    if (integrity) {
      script.integrity = integrity
      script.crossOrigin = 'anonymous'
    }

    const handleLoad = () => {
      setLoaded(true)
      onLoad?.()
    }

    const handleError = (e: ErrorEvent) => {
      const error = new Error(`Failed to load script: ${cdnUrl}`)
      setError(error)
      
      // Try fallback if available
      if (fallbackSrc && script.src !== fallbackSrc) {
        console.warn(`CDN script failed, trying fallback: ${fallbackSrc}`)
        script.src = fallbackSrc
        script.integrity = '' // Remove integrity for fallback
      } else {
        onError?.(error)
      }
    }

    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)
    
    document.body.appendChild(script)

    return () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
      document.body.removeChild(script)
    }
  }, [src, integrity, async, defer, onLoad, onError, fallbackSrc])

  return null
}

// Preload component for critical scripts
export function CDNPreloadScript({ src, integrity }: { src: string; integrity?: string }) {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'script'
    link.href = getCDNUrl(src)
    
    if (integrity) {
      link.integrity = integrity
      link.crossOrigin = 'anonymous'
    }
    
    document.head.appendChild(link)
    
    return () => {
      document.head.removeChild(link)
    }
  }, [src, integrity])
  
  return null
}