import { NodeSDK } from '@opentelemetry/sdk-node'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import * as api from '@opentelemetry/api'

// Configure OpenTelemetry
export function initializeOpenTelemetry() {
  // Skip in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.OTEL_ENABLED) {
    return
  }

  const resource = Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'zenya',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      'service.namespace': 'zenya',
      'service.instance.id': process.env.VERCEL_DEPLOYMENT_ID || 'local',
    })
  )

  // Configure trace exporter
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? 
      JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : {},
  })

  // Configure metrics exporter
  const metricExporter = new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
    headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? 
      JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : {},
  })

  // Create SDK
  const sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 60000, // Export every minute
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false, // Disable fs instrumentation to reduce noise
        },
      }),
    ],
  })

  // Initialize the SDK
  sdk.start()

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('OpenTelemetry terminated'))
      .catch((error) => console.error('Error terminating OpenTelemetry', error))
      .finally(() => process.exit(0))
  })
}

// Get the configured tracer
export const tracer = api.trace.getTracer('zenya', process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0')

// Get the configured meter
export const meter = api.metrics.getMeter('zenya', process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0')

// Custom span wrapper for tracing functions
export function withSpan<T extends (...args: any[]) => any>(
  name: string,
  fn: T,
  options?: api.SpanOptions
): T {
  return ((...args: Parameters<T>) => {
    return tracer.startActiveSpan(name, options || {}, (span) => {
      try {
        const result = fn(...args)
        
        // Handle promises
        if (result instanceof Promise) {
          return result
            .then((res) => {
              span.setStatus({ code: api.SpanStatusCode.OK })
              span.end()
              return res
            })
            .catch((error) => {
              span.setStatus({
                code: api.SpanStatusCode.ERROR,
                message: error.message,
              })
              span.recordException(error)
              span.end()
              throw error
            })
        }
        
        // Handle sync functions
        span.setStatus({ code: api.SpanStatusCode.OK })
        span.end()
        return result
      } catch (error) {
        span.setStatus({
          code: api.SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        })
        span.recordException(error as Error)
        span.end()
        throw error
      }
    })
  }) as T
}

// Create custom metrics
export const metrics = {
  // HTTP metrics
  httpRequestDuration: meter.createHistogram('http.request.duration', {
    description: 'HTTP request duration in milliseconds',
    unit: 'ms',
  }),
  
  httpActiveRequests: meter.createUpDownCounter('http.active_requests', {
    description: 'Number of active HTTP requests',
  }),
  
  // AI metrics
  aiRequestDuration: meter.createHistogram('ai.request.duration', {
    description: 'AI API request duration in milliseconds',
    unit: 'ms',
  }),
  
  aiTokensUsed: meter.createCounter('ai.tokens.used', {
    description: 'Number of AI tokens consumed',
  }),
  
  aiRequestErrors: meter.createCounter('ai.request.errors', {
    description: 'Number of AI request errors',
  }),
  
  // Business metrics
  userSignups: meter.createCounter('user.signups', {
    description: 'Number of user signups',
  }),
  
  lessonsCompleted: meter.createCounter('lessons.completed', {
    description: 'Number of lessons completed',
  }),
  
  activeUsers: meter.createUpDownCounter('users.active', {
    description: 'Number of currently active users',
  }),
}

// Context propagation helpers
export function extractContext(headers: Headers): api.Context {
  const carrier: Record<string, string> = {}
  headers.forEach((value, key) => {
    carrier[key] = value
  })
  
  return api.propagation.extract(api.context.active(), carrier)
}

export function injectContext(headers: Headers = new Headers()): Headers {
  const carrier: Record<string, string> = {}
  api.propagation.inject(api.context.active(), carrier)
  
  Object.entries(carrier).forEach(([key, value]) => {
    headers.set(key, value)
  })
  
  return headers
}

// Middleware for Next.js API routes
export function withTracing(
  handler: (req: Request) => Promise<Response>,
  spanName?: string
) {
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url)
    const name = spanName || `${req.method} ${url.pathname}`
    
    return tracer.startActiveSpan(name, {
      kind: api.SpanKind.SERVER,
      attributes: {
        'http.method': req.method,
        'http.url': url.href,
        'http.target': url.pathname,
        'http.host': url.host,
        'http.scheme': url.protocol.replace(':', ''),
        'http.user_agent': req.headers.get('user-agent') || '',
      },
    }, async (span) => {
      metrics.httpActiveRequests.add(1)
      const startTime = Date.now()
      
      try {
        const response = await handler(req)
        const duration = Date.now() - startTime
        
        span.setAttributes({
          'http.status_code': response.status,
          'http.response_content_length': response.headers.get('content-length') || 0,
        })
        
        if (response.status >= 400) {
          span.setStatus({
            code: api.SpanStatusCode.ERROR,
            message: `HTTP ${response.status}`,
          })
        } else {
          span.setStatus({ code: api.SpanStatusCode.OK })
        }
        
        metrics.httpRequestDuration.record(duration, {
          method: req.method,
          route: url.pathname,
          status: response.status.toString(),
        })
        
        return response
      } catch (error) {
        span.setStatus({
          code: api.SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        })
        span.recordException(error as Error)
        throw error
      } finally {
        metrics.httpActiveRequests.add(-1)
        span.end()
      }
    })
  }
}