'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development, will be handled by production error tracking
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center shadow-premium">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
          Oops! Something went wrong
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Don't worry, we've been notified and are working on fixing this issue.
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={reset}
            className="btn-premium w-full"
          >
            Try again
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go to homepage
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Error details (dev only)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}