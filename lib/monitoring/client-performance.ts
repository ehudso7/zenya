/**
 * Client-side Performance Monitoring
 * God-tier performance tracking that works in browser environment
 */

class ClientPerformanceMonitor {
  private metrics: Map<string, any[]> = new Map()
  private userInteractions: Map<string, number> = new Map()

  trackMetric(metric: {
    name: string
    value: number
    unit: string
    metadata?: Record<string, any>
  }) {
    const { name, value, unit, metadata } = metric
    
    // Store metrics locally
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    this.metrics.get(name)!.push({
      value,
      unit,
      metadata,
      timestamp: Date.now()
    })

    // Send to analytics in batches
    this.scheduleMetricFlush()

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Performance] ${name}: ${value}${unit}`, metadata)
    }
  }

  trackUserInteraction(action: string, category: string = 'general', value: number = 1) {
    const key = `${category}:${action}`
    const current = this.userInteractions.get(key) || 0
    this.userInteractions.set(key, current + value)

    // Track as metric
    this.trackMetric({
      name: 'user_interaction',
      value,
      unit: 'count',
      metadata: { action, category }
    })
  }

  trackError(error: Error, context: string) {
    // Send error to monitoring service
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { context },
        extra: {
          performance_context: context,
          timestamp: Date.now()
        }
      })
    }

    // Track as metric
    this.trackMetric({
      name: 'client_error',
      value: 1,
      unit: 'count',
      metadata: {
        context,
        errorType: error.name,
        errorMessage: error.message
      }
    })
  }

  private flushTimer: NodeJS.Timeout | null = null

  private scheduleMetricFlush() {
    if (this.flushTimer) return

    this.flushTimer = setTimeout(() => {
      this.flushMetrics()
      this.flushTimer = null
    }, 5000) // Flush every 5 seconds
  }

  private async flushMetrics() {
    if (this.metrics.size === 0) return

    const metricsToSend = Array.from(this.metrics.entries()).map(([name, values]) => ({
      name,
      values: values.slice(-100) // Keep last 100 values
    }))

    // Clear old metrics
    this.metrics.clear()

    try {
      // Send to backend
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: metricsToSend })
      })
    } catch (error) {
      console.error('Failed to send metrics:', error)
    }
  }

  // Web Vitals tracking
  trackWebVitals() {
    if (typeof window === 'undefined') return

    // Track Core Web Vitals
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.trackMetric({
              name: 'web_vitals_lcp',
              value: entry.startTime,
              unit: 'ms'
            })
          }
        }
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })

      // Track First Input Delay
      if ('PerformanceEventTiming' in window) {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-input') {
              const eventEntry = entry as any
              this.trackMetric({
                name: 'web_vitals_fid',
                value: eventEntry.processingStart - eventEntry.startTime,
                unit: 'ms'
              })
            }
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
      }

      // Track Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutEntry = entry as any
          if (!layoutEntry.hadRecentInput) {
            clsValue += layoutEntry.value
            this.trackMetric({
              name: 'web_vitals_cls',
              value: clsValue,
              unit: 'score'
            })
          }
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('Web Vitals tracking not supported:', error)
    }
  }
}

// Create singleton instance
export const performanceMonitor = new ClientPerformanceMonitor()

// Auto-initialize Web Vitals tracking
if (typeof window !== 'undefined') {
  performanceMonitor.trackWebVitals()
}

// Declare global type for TypeScript
declare global {
  interface Window {
    Sentry: any
  }
}