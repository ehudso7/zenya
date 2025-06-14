import { debugLogger } from './debug-logger'

// Global fetch interceptor to catch all API errors
export function initializeDebugInterceptor() {
  if (typeof window === 'undefined') return
  
  const originalFetch = window.fetch
  
  window.fetch = async function(...args) {
    const [url, options] = args
    const method = options?.method || 'GET'
    
    try {
      const response = await originalFetch(...args)
      
      // Log errors
      if (!response.ok) {
        const clonedResponse = response.clone()
        try {
          const errorData = await clonedResponse.json()
          debugLogger.api(method, url.toString(), options?.body, {
            status: response.status,
            error: errorData?.error || errorData?.message || errorData,
            message: errorData?.error || errorData?.message || `HTTP ${response.status}`
          })
        } catch {
          debugLogger.api(method, url.toString(), options?.body, {
            status: response.status,
            error: `HTTP ${response.status} ${response.statusText}`
          })
        }
      }
      
      return response
    } catch (error) {
      debugLogger.error(`Fetch error: ${method} ${url}`, error)
      throw error
    }
  }
}