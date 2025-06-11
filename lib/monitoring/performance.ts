/**
 * Production-grade performance monitoring and analytics
 * Tracks Core Web Vitals, API performance, and user experience metrics
 */

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  userId?: string
  sessionId?: string
  route?: string
  metadata?: Record<string, any>
}

export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private sessionId: string
  private userId?: string
  private isEnabled: boolean

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isEnabled = process.env.NODE_ENV === 'production' || process.env.ENABLE_PERFORMANCE_MONITORING === 'true'
    
    if (typeof window !== 'undefined' && this.isEnabled) {
      this.initializeWebVitals()
      this.initializeNavigationTracking()
      this.initializeResourceTracking()
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  public setUserId(userId: string): void {
    this.userId = userId
  }

  public trackMetric(metric: Omit<PerformanceMetric, 'timestamp' | 'sessionId' | 'userId'>): void {
    if (!this.isEnabled) return

    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    this.metrics.push(fullMetric)
    this.sendMetricToBackend(fullMetric)
  }

  private initializeWebVitals(): void {
    // Track Core Web Vitals using web-vitals library pattern
    if (typeof window !== 'undefined') {
      // Largest Contentful Paint (LCP)
      this.observeLCP()
      
      // First Input Delay (FID) / Interaction to Next Paint (INP)
      this.observeFID()
      
      // Cumulative Layout Shift (CLS)
      this.observeCLS()
      
      // First Contentful Paint (FCP)
      this.observeFCP()
      
      // Time to First Byte (TTFB)
      this.observeTTFB()
    }
  }

  private observeLCP(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      
      if (lastEntry) {
        this.trackWebVital({
          name: 'LCP',
          value: lastEntry.startTime,
          rating: this.rateMetric('LCP', lastEntry.startTime),
          delta: lastEntry.startTime,
          id: this.sessionId,
          navigationType: this.getNavigationType()
        })
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  }

  private observeFID(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (entry.processingStart > entry.startTime) {
          const value = entry.processingStart - entry.startTime
          this.trackWebVital({
            name: 'FID',
            value,
            rating: this.rateMetric('FID', value),
            delta: value,
            id: this.sessionId,
            navigationType: this.getNavigationType()
          })
        }
      })
    }).observe({ type: 'first-input', buffered: true })
  }

  private observeCLS(): void {
    let clsValue = 0
    const clsEntries: any[] = []

    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsEntries.push(entry)
          clsValue += entry.value
        }
      })

      this.trackWebVital({
        name: 'CLS',
        value: clsValue,
        rating: this.rateMetric('CLS', clsValue),
        delta: clsValue,
        id: this.sessionId,
        navigationType: this.getNavigationType()
      })
    }).observe({ type: 'layout-shift', buffered: true })
  }

  private observeFCP(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          this.trackWebVital({
            name: 'FCP',
            value: entry.startTime,
            rating: this.rateMetric('FCP', entry.startTime),
            delta: entry.startTime,
            id: this.sessionId,
            navigationType: this.getNavigationType()
          })
        }
      })
    }).observe({ type: 'paint', buffered: true })
  }

  private observeTTFB(): void {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navEntry) {
      const ttfb = navEntry.responseStart - navEntry.requestStart
      this.trackWebVital({
        name: 'TTFB',
        value: ttfb,
        rating: this.rateMetric('TTFB', ttfb),
        delta: ttfb,
        id: this.sessionId,
        navigationType: this.getNavigationType()
      })
    }
  }

  private rateMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    }

    const threshold = thresholds[name as keyof typeof thresholds]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  private getNavigationType(): string {
    if (typeof window !== 'undefined' && 'navigation' in performance) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return navEntry.type || 'unknown'
    }
    return 'unknown'
  }

  private trackWebVital(vital: WebVitalsMetric): void {
    this.trackMetric({
      name: `web_vital_${vital.name.toLowerCase()}`,
      value: vital.value,
      unit: vital.name === 'CLS' ? 'score' : 'ms',
      route: window.location.pathname,
      metadata: {
        rating: vital.rating,
        navigationType: vital.navigationType,
        vitalsId: vital.id
      }
    })
  }

  private initializeNavigationTracking(): void {
    if (typeof window !== 'undefined') {
      // Track page load times
      window.addEventListener('load', () => {
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        this.trackMetric({
          name: 'page_load_time',
          value: navEntry.loadEventEnd - navEntry.fetchStart,
          unit: 'ms',
          route: window.location.pathname,
          metadata: {
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
            firstByte: navEntry.responseStart - navEntry.fetchStart,
            domComplete: navEntry.domComplete - navEntry.fetchStart
          }
        })
      })

      // Track route changes (for SPA navigation)
      let currentPath = window.location.pathname
      const observer = new MutationObserver(() => {
        if (window.location.pathname !== currentPath) {
          this.trackMetric({
            name: 'route_change',
            value: performance.now(),
            unit: 'ms',
            route: window.location.pathname,
            metadata: {
              previousRoute: currentPath,
              newRoute: window.location.pathname
            }
          })
          currentPath = window.location.pathname
        }
      })

      observer.observe(document, { subtree: true, childList: true })
    }
  }

  private initializeResourceTracking(): void {
    if (typeof window !== 'undefined') {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (entry.initiatorType && entry.duration > 0) {
            this.trackMetric({
              name: 'resource_load_time',
              value: entry.duration,
              unit: 'ms',
              route: window.location.pathname,
              metadata: {
                resourceName: entry.name,
                resourceType: entry.initiatorType,
                transferSize: entry.transferSize,
                encodedBodySize: entry.encodedBodySize,
                decodedBodySize: entry.decodedBodySize
              }
            })
          }
        })
      }).observe({ type: 'resource', buffered: true })
    }
  }

  public trackAPIPerformance(endpoint: string, method: string, duration: number, status: number): void {
    this.trackMetric({
      name: 'api_request_duration',
      value: duration,
      unit: 'ms',
      route: endpoint,
      metadata: {
        method,
        status,
        statusClass: Math.floor(status / 100) + 'xx'
      }
    })
  }

  public trackUserInteraction(action: string, element?: string, value?: number): void {
    this.trackMetric({
      name: 'user_interaction',
      value: value || performance.now(),
      unit: value ? 'count' : 'ms',
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
      metadata: {
        action,
        element,
        timestamp: Date.now()
      }
    })
  }

  public trackError(error: Error, context?: string): void {
    this.trackMetric({
      name: 'client_error',
      value: 1,
      unit: 'count',
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
      metadata: {
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 1000), // Limit stack trace size
        context,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      }
    })
  }

  private async sendMetricToBackend(_metric: PerformanceMetric): Promise<void> {
    if (!this.isEnabled) return

    try {
      // Batch metrics to reduce requests
      if (this.metrics.length % 10 === 0) {
        await fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: this.metrics.slice(-10)
          })
        })
      }
    } catch (error) {
      // Silently fail to avoid impacting user experience
      console.warn('Failed to send performance metrics:', error)
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  public getMetricsSummary(): Record<string, any> {
    const summary: Record<string, any> = {}
    
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
          values: []
        }
      }
      
      const s = summary[metric.name]
      s.count++
      s.total += metric.value
      s.min = Math.min(s.min, metric.value)
      s.max = Math.max(s.max, metric.value)
      s.values.push(metric.value)
    })

    // Calculate averages and percentiles
    Object.keys(summary).forEach(key => {
      const s = summary[key]
      s.average = s.total / s.count
      s.values.sort((a: number, b: number) => a - b)
      s.p50 = this.percentile(s.values, 50)
      s.p95 = this.percentile(s.values, 95)
      s.p99 = this.percentile(s.values, 99)
      delete s.values // Remove raw values to reduce payload size
    })

    return summary
  }

  private percentile(values: number[], p: number): number {
    const index = Math.ceil((p / 100) * values.length) - 1
    return values[Math.max(0, index)]
  }

  public flush(): void {
    if (this.metrics.length > 0) {
      this.sendMetricToBackend(this.metrics[0]) // Trigger batch send
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Helper function to track API calls
export function trackAPICall<T>(
  endpoint: string,
  method: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  return apiCall()
    .then(result => {
      const duration = performance.now() - start
      performanceMonitor.trackAPIPerformance(endpoint, method, duration, 200)
      return result
    })
    .catch(error => {
      const duration = performance.now() - start
      const status = error.status || 500
      performanceMonitor.trackAPIPerformance(endpoint, method, duration, status)
      throw error
    })
}

// React hook for tracking component render performance
export function usePerformanceTracking(componentName: string) {
  if (typeof window !== 'undefined') {
    const startTime = performance.now()
    
    return {
      trackRender: () => {
        const renderTime = performance.now() - startTime
        performanceMonitor.trackMetric({
          name: 'component_render_time',
          value: renderTime,
          unit: 'ms',
          route: window.location.pathname,
          metadata: { componentName }
        })
      }
    }
  }
  
  return { trackRender: () => {} }
}