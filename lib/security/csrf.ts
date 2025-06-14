/**
 * CSRF Protection for Zenya AI
 * Implements double-submit cookie pattern for CSRF protection
 */

import { cookies } from 'next/headers'

const CSRF_COOKIE_NAME = 'zenya-csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const TOKEN_LENGTH = 32

/**
 * Timing-safe string comparison for edge runtime
 * Prevents timing attacks by ensuring constant-time comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  // Use Web Crypto API for edge runtime compatibility
  const array = new Uint8Array(TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Set CSRF token in cookies
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken()
  const cookieStore = await cookies()
  
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Allow JavaScript to read the token for AJAX requests
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
  
  return token
}

/**
 * Get CSRF token from cookies
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(CSRF_COOKIE_NAME)
  return token?.value || null
}

/**
 * Validate CSRF token from request
 */
export async function validateCSRFToken(request: Request): Promise<boolean> {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true
  }

  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  
  // Also check for token in body for form submissions
  let bodyToken: string | null = null
  if (request.headers.get('content-type')?.includes('application/json')) {
    try {
      const body = await request.clone().json()
      bodyToken = body._csrf || null
    } catch {
      // Invalid JSON, ignore
    }
  }
  
  const requestToken = headerToken || bodyToken
  
  if (!cookieToken || !requestToken) {
    return false
  }
  
  // Constant-time comparison to prevent timing attacks
  // Using a timing-safe comparison compatible with edge runtime
  return timingSafeEqual(cookieToken, requestToken)
}

/**
 * CSRF middleware for API routes
 */
export async function csrfMiddleware(request: Request): Promise<Response | null> {
  const isValid = await validateCSRFToken(request)
  
  if (!isValid) {
    return new Response(
      JSON.stringify({ error: 'Invalid CSRF token' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
  
  return null // Continue with request
}

/**
 * Hook for client-side CSRF token management
 */
export function useCSRFToken() {
  if (typeof window === 'undefined') {
    return { token: null, addToRequest: (req: any) => req }
  }
  
  // Get token from cookie
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith(CSRF_COOKIE_NAME))
    ?.split('=')[1]
  
  // Helper to add token to fetch requests
  const addToRequest = (options: RequestInit = {}): RequestInit => {
    return {
      ...options,
      headers: {
        ...options.headers,
        [CSRF_HEADER_NAME]: token || '',
      },
    }
  }
  
  return { token, addToRequest }
}