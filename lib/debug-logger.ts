// Debug logger that sends logs to the debug stream
class DebugLogger {
  private static instance: DebugLogger
  private enabled = false
  private sessionId: string | null = null
  private queue: any[] = []
  private isConnected = false
  private isDevelopment = false

  private constructor() {
    // Generate session ID
    this.sessionId = `debug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Check environment once during initialization
    if (typeof window !== 'undefined') {
      try {
        this.isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1'
        this.enabled = this.isDevelopment || window.localStorage?.getItem('DEBUG') === 'true'
        
        // Log initialization
        if (this.enabled) {
          // eslint-disable-next-line no-console
          console.log('[DebugLogger] Initialized - enabled:', this.enabled, 'isDevelopment:', this.isDevelopment, 'sessionId:', this.sessionId)
        }
      } catch {
        // Silently fail if window.location access fails
        this.enabled = false
      }
    } else {
      this.enabled = false
    }
  }

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger()
    }
    return DebugLogger.instance
  }

  enable() {
    this.enabled = true
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('DEBUG', 'true')
      } catch {
        // Silently fail if localStorage is not available
      }
    }
  }

  disable() {
    this.enabled = false
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('DEBUG')
      } catch {
        // Silently fail if localStorage is not available
      }
    }
  }

  private sendToStream(type: string, data: any) {
    // Always send errors, even if debug is disabled
    const isError = type === 'error' || data?.isError
    if ((!this.enabled && !isError) || typeof window === 'undefined') {
      return
    }

    // Use setTimeout to avoid blocking and potential recursion
    setTimeout(() => {
      // Try the connect endpoint (where the monitor is listening)
      fetch('/api/debug/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, sessionId: this.sessionId })
      }).catch(() => {
        // Silently fail - don't log errors about logging
      })
    }, 0)
  }

  // Log different types of events
  log(message: string, data?: any) {
    if (!this.enabled) return
    // eslint-disable-next-line no-console
    console.log(`[DEBUG] ${message}`, data)
    this.sendToStream('log', { message, data })
  }

  error(message: string, error?: any) {
    // Always log errors, even if debug is disabled
    console.error(`[DEBUG ERROR] ${message}`, error)
    
    // Safely extract error information to avoid circular references
    let errorInfo: any = error
    if (error instanceof Error) {
      errorInfo = {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 5).join('\n') // Limit stack trace
      }
    } else if (error && typeof error === 'object') {
      try {
        // Try to safely stringify the error object
        errorInfo = JSON.parse(JSON.stringify(error))
      } catch {
        errorInfo = String(error)
      }
    }
    
    this.sendToStream('error', { 
      message, 
      error: errorInfo,
      isError: true 
    })
  }

  api(method: string, url: string, data?: any, response?: any) {
    // Always log API errors even if debug is disabled
    const isError = response?.error || response?.status >= 400
    
    // Safely process data and response to avoid circular references
    let safeData = data
    let safeResponse = response
    
    try {
      if (data && typeof data === 'string') {
        // Try to parse JSON body data
        try {
          safeData = JSON.parse(data)
        } catch {
          safeData = data
        }
      }
      
      if (response && typeof response === 'object') {
        // Extract only safe properties from response
        safeResponse = {
          status: response.status,
          error: response.error,
          message: response.message,
          ...(response.data && { data: response.data })
        }
      }
    } catch {
      // If processing fails, use string representation
      safeData = String(data)
      safeResponse = String(response)
    }
    
    // Always send errors to stream regardless of enabled state
    if (isError) {
      console.error(`[DEBUG API ERROR] ${method} ${url}`, { data: safeData, response: safeResponse })
      // Force send errors to stream
      this.sendToStream('error', { 
        message: `API Error: ${method} ${url}`,
        method, 
        url, 
        data: safeData, 
        response: safeResponse,
        error: safeResponse?.error || safeResponse?.message || `HTTP ${safeResponse?.status}`,
        isError: true 
      })
    } else if (this.enabled) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG API] ${method} ${url}`, { data: safeData, response: safeResponse })
      this.sendToStream('api', { method, url, data: safeData, response: safeResponse, isError })
    }
  }

  user(action: string, data?: any) {
    if (!this.enabled) return
    // eslint-disable-next-line no-console
    console.log(`[DEBUG USER] ${action}`, data)
    this.sendToStream('user', { action, data })
  }

  performance(metric: string, value: number, metadata?: any) {
    if (!this.enabled) return
    // eslint-disable-next-line no-console
    console.log(`[DEBUG PERF] ${metric}: ${value}ms`, metadata)
    this.sendToStream('performance', { metric, value, metadata })
  }

  state(component: string, state: any, action?: string) {
    if (!this.enabled) return
    // eslint-disable-next-line no-console
    console.log(`[DEBUG STATE] ${component}${action ? ` - ${action}` : ''}`, state)
    this.sendToStream('state', { component, state, action })
  }

  voice(event: string, data?: any) {
    if (!this.enabled) return
    // eslint-disable-next-line no-console
    console.log(`[DEBUG VOICE] ${event}`, data)
    this.sendToStream('voice', { event, data })
  }
}

// Export singleton instance
export const debugLogger = DebugLogger.getInstance()

// Browser-only: Add global debug commands
if (typeof window !== 'undefined') {
  // Add global debug commands
  try {
    ;(window as any).debug = {
      enable: () => debugLogger.enable(),
      disable: () => debugLogger.disable(),
      log: (message: string, data?: any) => debugLogger.log(message, data),
    }
  } catch {
    // Silently fail if we can't add to window
  }
}