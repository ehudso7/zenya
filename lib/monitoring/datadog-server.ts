import tracer from 'dd-trace'
import { StatsD } from 'hot-shots'

// Initialize Datadog APM tracer
if (process.env.DD_AGENT_HOST) {
  tracer.init({
    service: 'zenya-api',
    env: process.env.NODE_ENV || 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    runtimeMetrics: true,
    logInjection: true,
    profiling: true,
    analytics: true,
    tags: {
      'app.name': 'zenya',
      'app.platform': 'nextjs',
    },
  })
}

// Initialize StatsD client for custom metrics
const dogstatsd = new StatsD({
  host: process.env.DD_AGENT_HOST || 'localhost',
  port: 8125,
  prefix: 'zenya.',
  globalTags: [`env:${process.env.NODE_ENV}`, 'service:zenya-api'],
  errorHandler: (error) => {
    console.error('DogStatsD error:', error)
  },
})

// Server-side logger
export const serverLogger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.info(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      service: 'zenya-api',
      env: process.env.NODE_ENV,
      ...meta,
    }))
  },
  
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      service: 'zenya-api',
      env: process.env.NODE_ENV,
      ...meta,
    }))
  },
  
  error: (message: string, error?: Error, meta?: Record<string, any>) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      },
      timestamp: new Date().toISOString(),
      service: 'zenya-api',
      env: process.env.NODE_ENV,
      ...meta,
    }))
  },
}

// Metrics helper functions
export const metrics = {
  // Increment a counter
  increment: (metric: string, value = 1, tags?: string[]) => {
    dogstatsd.increment(metric, value, tags)
  },
  
  // Record a gauge value
  gauge: (metric: string, value: number, tags?: string[]) => {
    dogstatsd.gauge(metric, value, tags)
  },
  
  // Record a histogram value
  histogram: (metric: string, value: number, tags?: string[]) => {
    dogstatsd.histogram(metric, value, tags)
  },
  
  // Record timing
  timing: (metric: string, duration: number, tags?: string[]) => {
    dogstatsd.timing(metric, duration, tags)
  },
  
  // Track API response times
  trackApiCall: (endpoint: string, duration: number, statusCode: number) => {
    const tags = [
      `endpoint:${endpoint}`,
      `status:${statusCode}`,
      `status_category:${Math.floor(statusCode / 100)}xx`,
    ]
    
    dogstatsd.timing('api.response_time', duration, tags)
    dogstatsd.increment('api.requests', 1, tags)
    
    if (statusCode >= 400) {
      dogstatsd.increment('api.errors', 1, tags)
    }
  },
  
  // Track AI provider usage
  trackAiUsage: (provider: string, model: string, tokens: number, duration: number) => {
    const tags = [`provider:${provider}`, `model:${model}`]
    
    dogstatsd.increment('ai.requests', 1, tags)
    dogstatsd.histogram('ai.tokens', tokens, tags)
    dogstatsd.timing('ai.response_time', duration, tags)
  },
  
  // Track user actions
  trackUserAction: (action: string, userId?: string) => {
    const tags = [`action:${action}`]
    if (userId) tags.push(`user:${userId}`)
    
    dogstatsd.increment('user.actions', 1, tags)
  },
}

// Middleware for tracking API performance
export function createApiMetricsMiddleware() {
  return async (req: Request, handler: () => Promise<Response>) => {
    const start = Date.now()
    const url = new URL(req.url)
    const endpoint = url.pathname
    
    try {
      const response = await handler()
      const duration = Date.now() - start
      
      metrics.trackApiCall(endpoint, duration, response.status)
      
      return response
    } catch (_error) {
      const duration = Date.now() - start
      metrics.trackApiCall(endpoint, duration, 500)
      throw error
    }
  }
}

// Trace async functions
export function trace<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    const span = tracer.scope().active()
    if (span) {
      span.setTag('function.name', name)
    }
    
    const start = Date.now()
    try {
      const result = await fn(...args)
      metrics.timing(`function.${name}`, Date.now() - start, ['status:success'])
      return result
    } catch (_error) {
      metrics.timing(`function.${name}`, Date.now() - start, ['status:error'])
      throw error
    }
  }) as T
}