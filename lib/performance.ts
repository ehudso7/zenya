// Performance monitoring utilities

interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'MB' | 'count'
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  
  // Measure function execution time
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration, 'ms')
      return result
    } catch (_error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration, 'ms')
      throw error
    }
  }
  
  // Measure sync function execution time
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
      const result = fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration, 'ms')
      return result
    } catch (_error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration, 'ms')
      throw error
    }
  }
  
  // Record a custom metric
  recordMetric(name: string, value: number, unit: PerformanceMetric['unit']) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const metrics = this.metrics.get(name)!
    metrics.push({ name, value, unit })
    
    // Keep only last 100 metrics per name to prevent memory leaks
    if (metrics.length > 100) {
      metrics.shift()
    }
  }
  
  // Get metrics summary
  getMetricsSummary(name: string) {
    const metrics = this.metrics.get(name) || []
    if (metrics.length === 0) return null
    
    const values = metrics.map(m => m.value)
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    return {
      name,
      count: metrics.length,
      average: avg,
      min,
      max,
      unit: metrics[0].unit
    }
  }
  
  // Get all metrics summaries
  getAllMetricsSummaries() {
    const summaries: any[] = []
    this.metrics.forEach((_, name) => {
      const summary = this.getMetricsSummary(name)
      if (summary) summaries.push(summary)
    })
    return summaries
  }
  
  // Clear metrics
  clear() {
    this.metrics.clear()
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Utility to report Web Vitals
export function reportWebVitals(_metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    // Example: sendToAnalytics(_metric)
  }
}

// Utility to measure component render time
export function measureComponentPerformance(componentName: string) {
  return function decorator(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function (...args: any[]) {
      return performanceMonitor.measure(`${componentName}_render`, () => {
        return originalMethod.apply(this, args)
      })
    }
    
    return descriptor
  }
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // This would integrate with webpack-bundle-analyzer in development
  }
}