// Debug logger that sends logs to the debug stream
class DebugLogger {
  private static instance: DebugLogger
  private enabled = false
  private sessionId: string | null = null
  private queue: any[] = []
  private isConnected = false

  private constructor() {
    // Enable debug mode in development or when DEBUG flag is set
    this.enabled = process.env.NODE_ENV === 'development' || 
                   typeof window !== 'undefined' && window.localStorage?.getItem('DEBUG') === 'true'
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
      window.localStorage.setItem('DEBUG', 'true')
    }
  }

  disable() {
    this.enabled = false
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('DEBUG')
    }
  }

  private async sendToStream(type: string, data: any) {
    if (!this.enabled || typeof window === 'undefined') return

    try {
      await fetch('/api/debug/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, sessionId: this.sessionId })
      })
    } catch (error) {
      console.error('Failed to send debug log:', error)
    }
  }

  // Log different types of events
  log(message: string, data?: any) {
    if (!this.enabled) return
    console.log(`[DEBUG] ${message}`, data)
    this.sendToStream('log', { message, data })
  }

  error(message: string, error?: any) {
    if (!this.enabled) return
    console.error(`[DEBUG ERROR] ${message}`, error)
    this.sendToStream('error', { 
      message, 
      error: error?.message || error,
      stack: error?.stack 
    })
  }

  api(method: string, url: string, data?: any, response?: any) {
    if (!this.enabled) return
    console.log(`[DEBUG API] ${method} ${url}`, { data, response })
    this.sendToStream('api', { method, url, data, response })
  }

  user(action: string, data?: any) {
    if (!this.enabled) return
    console.log(`[DEBUG USER] ${action}`, data)
    this.sendToStream('user', { action, data })
  }

  performance(metric: string, value: number, metadata?: any) {
    if (!this.enabled) return
    console.log(`[DEBUG PERF] ${metric}: ${value}ms`, metadata)
    this.sendToStream('performance', { metric, value, metadata })
  }

  state(component: string, state: any, action?: string) {
    if (!this.enabled) return
    console.log(`[DEBUG STATE] ${component}${action ? ` - ${action}` : ''}`, state)
    this.sendToStream('state', { component, state, action })
  }

  voice(event: string, data?: any) {
    if (!this.enabled) return
    console.log(`[DEBUG VOICE] ${event}`, data)
    this.sendToStream('voice', { event, data })
  }
}

// Export singleton instance
export const debugLogger = DebugLogger.getInstance()

// Browser-only: Connect to debug stream
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Auto-enable in development
  debugLogger.enable()
  
  // Add global debug commands
  ;(window as any).debug = {
    enable: () => debugLogger.enable(),
    disable: () => debugLogger.disable(),
    log: (message: string, data?: any) => debugLogger.log(message, data),
  }
}