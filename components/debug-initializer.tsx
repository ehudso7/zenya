'use client'

import { useEffect } from 'react'
import { debugLogger } from '@/lib/debug-logger'

export function DebugInitializer() {
  useEffect(() => {
    // Enable debug logger in development
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1'
      
      if (isLocalhost) {
        debugLogger.enable()
        // eslint-disable-next-line no-console
        console.log('[Debug] Debug logger enabled for localhost')
      }
      
      // Also check for debug query parameter
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('debug') === 'true') {
        debugLogger.enable()
        // eslint-disable-next-line no-console
        console.log('[Debug] Debug logger enabled via query parameter')
      }
    }
  }, [])
  
  return null
}