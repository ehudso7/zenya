import { toast } from 'react-hot-toast'
import { debugLogger } from './debug-logger'

interface ApiOptions extends RequestInit {
  retries?: number
  retryDelay?: number
  showErrorToast?: boolean
  timeout?: number // in milliseconds
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiClient<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    showErrorToast = true,
    timeout = 30000, // 30 seconds default
    ...fetchOptions
  } = options

  // Get CSRF token from cookies
  let csrfToken: string | null = null
  if (typeof window !== 'undefined') {
    csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('zenya-csrf-token='))
      ?.split('=')[1] || null
    
    // If no CSRF token, try to get one
    if (!csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(fetchOptions.method || 'GET')) {
      try {
        const csrfResponse = await fetch('/api/csrf', { 
          credentials: 'include',
          cache: 'no-cache' 
        })
        if (csrfResponse.ok) {
          // Check cookies again after fetching
          csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('zenya-csrf-token='))
            ?.split('=')[1] || null
        }
      } catch (error) {
        debugLogger.error('Failed to fetch CSRF token', error)
      }
    }
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      debugLogger.api(fetchOptions.method || 'GET', url, fetchOptions.body, { attempt: attempt + 1 })
      
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers as Record<string, string>,
      }
      
      // Add CSRF token for state-changing operations
      if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(fetchOptions.method || 'GET')) {
        headers['x-csrf-token'] = csrfToken
      }
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers,
        credentials: 'include', // Ensure cookies are sent
      })
      
      clearTimeout(timeoutId)

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')

      if (!response.ok) {
        const errorData = isJson ? await response.json() : await response.text()
        debugLogger.api(fetchOptions.method || 'GET', url, fetchOptions.body, {
          status: response.status,
          error: errorData,
          attempt: attempt + 1
        })
        throw new ApiError(
          errorData.message || errorData.error || `HTTP ${response.status} error`,
          response.status,
          errorData
        )
      }

      const data = isJson ? await response.json() : await response.text()
      debugLogger.api(fetchOptions.method || 'GET', url, undefined, {
        status: response.status,
        success: true,
        responseType: isJson ? 'json' : 'text'
      })
      return data as T
    } catch (_error) {
      lastError = _error as Error

      // Don't retry on client errors (4xx)
      if (_error instanceof ApiError && _error.status >= 400 && _error.status < 500) {
        break
      }

      // Don't retry on the last attempt
      if (attempt < retries - 1) {
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
    }
  }

  // Handle the error
  if (showErrorToast) {
    if (lastError instanceof ApiError) {
      toast.error(lastError.message)
    } else if (lastError?.name === 'AbortError') {
      toast.error('Request timed out. Please try again.')
    } else if (lastError?.message === 'Failed to fetch') {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error('Something went wrong. Please try again.')
    }
  }

  throw lastError
}

// Convenience methods
export const api = {
  get: <T = any>(url: string, options?: ApiOptions) =>
    apiClient<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, data?: any, options?: ApiOptions) =>
    apiClient<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(url: string, data?: any, options?: ApiOptions) =>
    apiClient<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(url: string, options?: ApiOptions) =>
    apiClient<T>(url, { ...options, method: 'DELETE' }),
}

// Debounce helper for search/filter operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    // Store the original this context
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

// Network status helper
export function useNetworkStatus() {
  if (typeof window === 'undefined') return { isOnline: true }

  const isOnline = window.navigator.onLine

  window.addEventListener('online', () => {
    toast.success('Back online!')
  })

  window.addEventListener('offline', () => {
    toast.error('You are offline. Some features may not work.')
  })

  return { isOnline }
}