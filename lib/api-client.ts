import { toast } from 'react-hot-toast'

interface ApiOptions extends RequestInit {
  retries?: number
  retryDelay?: number
  showErrorToast?: boolean
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
    ...fetchOptions
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      })

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')

      if (!response.ok) {
        const errorData = isJson ? await response.json() : await response.text()
        throw new ApiError(
          errorData.message || errorData.error || `HTTP ${response.status} error`,
          response.status,
          errorData
        )
      }

      return isJson ? await response.json() : await response.text()
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
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