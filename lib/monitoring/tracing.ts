/**
 * Advanced OpenTelemetry Distributed Tracing for Zenya AI
 * God-Tier observability with comprehensive trace collection
 */

import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
// import { JaegerExporter } from '@opentelemetry/exporter-jaeger' // Not compatible with Next.js edge runtime
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base'
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api'
import { performanceMonitor } from './performance'

// Tracer instance
let tracer: any = null

// Initialize OpenTelemetry SDK
export function initializeTracing() {
  // Skip in browser environment
  if (typeof window !== 'undefined') {
    return
  }

  const serviceName = 'zenya-ai-platform'
  const serviceVersion = process.env.npm_package_version || '1.0.0'
  const environment = process.env.NODE_ENV || 'development'

  // Configure resource attributes
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'zenya-ai',
    [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.VERCEL_URL || 'localhost'
  })

  // Configure exporters
  const exporters = []

  // Console exporter for development
  if (environment === 'development') {
    exporters.push(new ConsoleSpanExporter())
  }

  // Jaeger exporter disabled for Next.js compatibility
  // if (process.env.JAEGER_ENDPOINT) {
  //   exporters.push(
  //     new JaegerExporter({
  //       endpoint: process.env.JAEGER_ENDPOINT,
  //       tags: [
  //         { key: 'service.name', value: serviceName },
  //         { key: 'service.version', value: serviceVersion },
  //         { key: 'environment', value: environment }
  //       ]
  //     })
  //   )
  // }

  // Create SDK
  const sdk = new NodeSDK({
    resource,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Customize instrumentation
        '@opentelemetry/instrumentation-fs': {
          enabled: false // Disable filesystem instrumentation to reduce noise
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          requestHook: (span, request) => {
            const req = request as any
            if (req.headers) {
              span.setAttributes({
                'http.user_agent': req.headers['user-agent'],
                'http.x_forwarded_for': req.headers['x-forwarded-for']
              })
            }
          }
        },
        '@opentelemetry/instrumentation-express': {
          enabled: true
        }
      })
    ],
    // Span processor configuration handled by SDK internally
  })

  try {
    sdk.start()
    tracer = trace.getTracer(serviceName, serviceVersion)
    console.log('✅ OpenTelemetry tracing initialized')
  } catch (error) {
    console.warn('⚠️ Failed to initialize tracing:', error)
  }
}

// Enhanced tracing utilities
export class TracingManager {
  private static instance: TracingManager
  private tracer: any

  private constructor() {
    this.tracer = tracer || trace.getTracer('zenya-ai-fallback')
  }

  static getInstance(): TracingManager {
    if (!TracingManager.instance) {
      TracingManager.instance = new TracingManager()
    }
    return TracingManager.instance
  }

  // Create a new span with enhanced attributes
  createSpan(name: string, options: {
    kind?: SpanKind
    attributes?: Record<string, any>
    parentContext?: any
  } = {}) {
    const span = this.tracer.startSpan(name, {
      kind: options.kind || SpanKind.INTERNAL,
      attributes: {
        'service.name': 'zenya-ai-platform',
        'service.component': this.getComponentFromSpanName(name),
        ...options.attributes
      }
    }, options.parentContext)

    return span
  }

  // Trace an async operation
  async traceOperation<T>(
    name: string,
    operation: (span: any) => Promise<T>,
    options: {
      kind?: SpanKind
      attributes?: Record<string, any>
    } = {}
  ): Promise<T> {
    const span = this.createSpan(name, options)
    const startTime = Date.now()

    try {
      const result = await operation(span)
      
      span.setStatus({ code: SpanStatusCode.OK })
      span.setAttributes({
        'operation.success': true,
        'operation.duration_ms': Date.now() - startTime
      })

      // Track in performance monitor
      performanceMonitor.trackMetric({
        name: `trace_${name.toLowerCase().replace(/\s+/g, '_')}`,
        value: Date.now() - startTime,
        unit: 'ms',
        metadata: {
          spanId: span.spanContext().spanId,
          traceId: span.spanContext().traceId
        }
      })

      return result
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message
      })
      span.setAttributes({
        'operation.success': false,
        'operation.duration_ms': Date.now() - startTime,
        'error.type': (error as Error).constructor.name,
        'error.message': (error as Error).message
      })

      throw error
    } finally {
      span.end()
    }
  }

  // Trace AI operations specifically
  async traceAIOperation<T>(
    provider: string,
    operation: string,
    aiOperation: (span: any) => Promise<T>,
    metadata: {
      model?: string
      promptTokens?: number
      maxTokens?: number
      temperature?: number
    } = {}
  ): Promise<T> {
    return this.traceOperation(
      `AI_${provider}_${operation}`,
      async (span) => {
        span.setAttributes({
          'ai.provider': provider,
          'ai.operation': operation,
          'ai.model': metadata.model || 'unknown',
          'ai.prompt_tokens': metadata.promptTokens || 0,
          'ai.max_tokens': metadata.maxTokens || 0,
          'ai.temperature': metadata.temperature || 0
        })

        const result = await aiOperation(span)

        // Add response metadata if available
        if (typeof result === 'object' && result !== null) {
          const responseData = result as any
          if (responseData.usage) {
            span.setAttributes({
              'ai.completion_tokens': responseData.usage.completion_tokens || 0,
              'ai.total_tokens': responseData.usage.total_tokens || 0
            })
          }
        }

        return result
      },
      {
        kind: SpanKind.CLIENT,
        attributes: {
          'component.type': 'ai_service',
          'ai.system': provider
        }
      }
    )
  }

  // Trace database operations
  async traceDatabaseOperation<T>(
    operation: string,
    table: string,
    dbOperation: (span: any) => Promise<T>,
    metadata: {
      query?: string
      filters?: Record<string, any>
      limit?: number
    } = {}
  ): Promise<T> {
    return this.traceOperation(
      `DB_${operation}_${table}`,
      async (span) => {
        span.setAttributes({
          'db.operation': operation,
          'db.table': table,
          'db.system': 'postgresql',
          'db.name': 'supabase',
          'db.statement': metadata.query?.substring(0, 200) || 'unknown',
          'db.limit': metadata.limit || 0
        })

        if (metadata.filters) {
          span.setAttributes({
            'db.filter_count': Object.keys(metadata.filters).length
          })
        }

        return await dbOperation(span)
      },
      {
        kind: SpanKind.CLIENT,
        attributes: {
          'component.type': 'database'
        }
      }
    )
  }

  // Trace HTTP requests
  async traceHttpRequest<T>(
    method: string,
    url: string,
    httpOperation: (span: any) => Promise<T>,
    metadata: {
      headers?: Record<string, string>
      body?: any
    } = {}
  ): Promise<T> {
    return this.traceOperation(
      `HTTP_${method}_${this.getUrlPath(url)}`,
      async (span) => {
        span.setAttributes({
          'http.method': method,
          'http.url': url,
          'http.scheme': new URL(url).protocol.replace(':', ''),
          'http.host': new URL(url).host,
          'http.target': new URL(url).pathname
        })

        if (metadata.headers) {
          Object.entries(metadata.headers).forEach(([key, value]) => {
            if (!this.isSensitiveHeader(key)) {
              span.setAttribute(`http.request.header.${key}`, value)
            }
          })
        }

        const result = await httpOperation(span)

        return result
      },
      {
        kind: SpanKind.CLIENT,
        attributes: {
          'component.type': 'http_client'
        }
      }
    )
  }

  // Add custom attributes to current span
  addAttributes(attributes: Record<string, any>) {
    const activeSpan = trace.getActiveSpan()
    if (activeSpan) {
      activeSpan.setAttributes(attributes)
    }
  }

  // Add event to current span
  addEvent(name: string, attributes?: Record<string, any>) {
    const activeSpan = trace.getActiveSpan()
    if (activeSpan) {
      activeSpan.addEvent(name, attributes)
    }
  }

  // Record exception in current span
  recordException(error: Error, attributes?: Record<string, any>) {
    const activeSpan = trace.getActiveSpan()
    if (activeSpan) {
      activeSpan.recordException(error)
      if (attributes) {
        activeSpan.setAttributes(attributes)
      }
    }
  }

  // Get current trace context
  getCurrentTraceContext() {
    const activeSpan = trace.getActiveSpan()
    if (activeSpan) {
      const spanContext = activeSpan.spanContext()
      return {
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
        traceFlags: spanContext.traceFlags
      }
    }
    return null
  }

  // Helper methods
  private getComponentFromSpanName(name: string): string {
    if (name.startsWith('AI_')) return 'ai_service'
    if (name.startsWith('DB_')) return 'database'
    if (name.startsWith('HTTP_')) return 'http_client'
    if (name.includes('middleware')) return 'middleware'
    if (name.includes('auth')) return 'authentication'
    return 'application'
  }

  private getUrlPath(url: string): string {
    try {
      return new URL(url).pathname.replace(/\//g, '_').substring(1) || 'root'
    } catch {
      return 'invalid_url'
    }
  }

  private isSensitiveHeader(headerName: string): boolean {
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'apikey'
    ]
    return sensitiveHeaders.some(sensitive => 
      headerName.toLowerCase().includes(sensitive)
    )
  }
}

// Decorator for automatic tracing
export function Traced(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const tracing = TracingManager.getInstance()

    descriptor.value = async function (...args: any[]) {
      const spanName = operationName || `${target.constructor.name}.${propertyKey}`
      
      return tracing.traceOperation(
        spanName,
        async (span) => {
          span.setAttributes({
            'code.function': propertyKey,
            'code.namespace': target.constructor.name,
            'code.arguments_count': args.length
          })

          return originalMethod.apply(this, args)
        }
      )
    }

    return descriptor
  }
}

// Express middleware for tracing HTTP requests
export function tracingMiddleware() {
  const tracing = TracingManager.getInstance()
  
  return async (req: any, res: any, next: any) => {
    const span = tracing.createSpan(`HTTP_${req.method}_${req.path}`, {
      kind: SpanKind.SERVER,
      attributes: {
        'http.method': req.method,
        'http.url': req.url,
        'http.route': req.route?.path || req.path,
        'http.user_agent': req.headers['user-agent'],
        'http.x_forwarded_for': req.headers['x-forwarded-for'],
        'component.type': 'http_server'
      }
    })

    // Add request ID if available
    if (req.headers['x-request-id']) {
      span.setAttribute('http.request_id', req.headers['x-request-id'])
    }

    const startTime = Date.now()

    res.on('finish', () => {
      span.setAttributes({
        'http.status_code': res.statusCode,
        'http.response_size': res.get('Content-Length') || 0,
        'http.duration_ms': Date.now() - startTime
      })

      if (res.statusCode >= 400) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP ${res.statusCode}`
        })
      } else {
        span.setStatus({ code: SpanStatusCode.OK })
      }

      span.end()
    })

    res.on('error', (error: Error) => {
      span.recordException(error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      })
      span.end()
    })

    next()
  }
}

// Initialize tracing on module load
if (process.env.NODE_ENV !== 'test') {
  initializeTracing()
}

// Export singleton instance
export const tracing = TracingManager.getInstance()

// Export trace context helpers
export { trace, context, SpanKind, SpanStatusCode }