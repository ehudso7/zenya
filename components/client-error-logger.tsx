'use client'

import { useEffect } from 'react'
import { debugLogger } from '@/lib/debug-logger'

export function ClientErrorLogger() {
  useEffect(() => {
    // Log any unhandled errors
    const handleError = (event: ErrorEvent) => {
      debugLogger.error('Client error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      })
    }

    // Log unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      debugLogger.error('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise
      })
    }

    // Log console errors
    const originalError = console.error
    console.error = (...args) => {
      debugLogger.error('Console error', args)
      originalError.apply(console, args)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
      console.error = originalError
    }
  }, [])

  return null
}