/**
 * Client-side hook for CSRF token management
 */

import { useEffect, useState } from 'react'

const CSRF_COOKIE_NAME = 'zenya-csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null)

  useEffect(() => {
    // Get CSRF token from cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${CSRF_COOKIE_NAME}=`))
      ?.split('=')[1]
    
    setCSRFToken(token || null)
  }, [])

  // Helper to add CSRF token to fetch requests
  const fetchWithCSRF = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers)
    
    if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
      headers.set(CSRF_HEADER_NAME, csrfToken)
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensure cookies are sent
    })
  }

  // Helper for JSON requests
  const fetchJSON = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers)
    headers.set('Content-Type', 'application/json')
    
    if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
      headers.set(CSRF_HEADER_NAME, csrfToken)
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  return {
    csrfToken,
    fetchWithCSRF,
    fetchJSON,
  }
}