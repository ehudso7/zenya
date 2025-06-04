import { datadogLogs } from '@datadog/browser-logs'
import { datadogRum } from '@datadog/browser-rum'

// Initialize Datadog RUM (Real User Monitoring)
export function initializeDatadog() {
  if (typeof window === 'undefined') return

  const environment = process.env.NODE_ENV
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'

  // Initialize RUM
  if (process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID && process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) {
    datadogRum.init({
      applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
      site: 'datadoghq.com',
      service: 'zenya-frontend',
      env: environment,
      version,
      sessionSampleRate: 100,
      sessionReplaySampleRate: environment === 'production' ? 20 : 100,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
      allowedTracingUrls: [
        { match: 'https://zenyaai.com', propagatorTypes: ['b3', 'tracecontext'] },
        { match: /https:\/\/.*\.supabase\.co/, propagatorTypes: ['b3', 'tracecontext'] }
      ],
    })
  }

  // Initialize Logs
  if (process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) {
    datadogLogs.init({
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
      site: 'datadoghq.com',
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,
      service: 'zenya-frontend',
      env: environment,
      version,
    })
  }
}

// Custom logger with Datadog integration
export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.info(message, context)
    if (typeof window !== 'undefined' && datadogLogs.logger) {
      datadogLogs.logger.info(message, context)
    }
  },
  
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(message, context)
    if (typeof window !== 'undefined' && datadogLogs.logger) {
      datadogLogs.logger.warn(message, context)
    }
  },
  
  error: (message: string, error?: Error, context?: Record<string, any>) => {
    console.error(message, error, context)
    if (typeof window !== 'undefined' && datadogLogs.logger) {
      datadogLogs.logger.error(message, { ...context, error: error?.stack })
    }
  },
  
  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(message, context)
    }
    if (typeof window !== 'undefined' && datadogLogs.logger) {
      datadogLogs.logger.debug(message, context)
    }
  },
}

// Track custom events
export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && datadogRum.addAction) {
    datadogRum.addAction(name, properties)
  }
}

// Track user information
export function setUser(user: { id: string; email?: string; name?: string }) {
  if (typeof window !== 'undefined' && datadogRum.setUser) {
    datadogRum.setUser({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  }
}

// Track custom timings
export function trackTiming(name: string, duration: number) {
  if (typeof window !== 'undefined' && datadogRum.addTiming) {
    datadogRum.addTiming(name, duration)
  }
}

// Error boundary integration
export function captureError(error: Error, errorInfo?: { componentStack?: string }) {
  logger.error('React Error Boundary', error, {
    componentStack: errorInfo?.componentStack,
    url: window.location.href,
    userAgent: navigator.userAgent,
  })
}