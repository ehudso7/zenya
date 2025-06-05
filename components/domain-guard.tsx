'use client'

import { useEffect, useState } from 'react'
import { isAuthorizedDomain, getDomainError } from '@/lib/domain-verification'

export default function DomainGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if running on an authorized domain
    const hostname = window.location.hostname
    const authorized = isAuthorizedDomain(hostname)
    setIsAuthorized(authorized)

    // Additional security: verify the app configuration
    if (authorized && process.env.NODE_ENV === 'production') {
      // Ensure critical endpoints point to zenyaai.com
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
        // Invalid configuration - prevent execution
        setIsAuthorized(false)
      }
    }
  }, [])

  // Still checking
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying domain authorization...</p>
        </div>
      </div>
    )
  }

  // Unauthorized domain
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Unauthorized Domain</h2>
            <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{getDomainError()}</p>
            <div className="mt-6">
              <a
                href="https://zenyaai.com"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Official Site
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Authorized - render children
  return <>{children}</>
}