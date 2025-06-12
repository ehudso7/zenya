import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.0,
  
  // Release Health
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  environment: process.env.NODE_ENV,
  
  // Enhanced Configuration
  maxBreadcrumbs: 100,
  attachStacktrace: true,
  sendDefaultPii: false,
  
  // Advanced Integrations
  integrations: [
    // Database performance monitoring
    Sentry.postgresIntegration(),
    // HTTP request tracking
    Sentry.httpIntegration(),
    // Console integration
    Sentry.consoleIntegration(),
  ],
  
  // Transaction naming and filtering
  beforeSendTransaction(event) {
    // Filter out noisy transactions
    if (event.transaction?.includes('/_next/') || 
        event.transaction?.includes('/api/health') ||
        event.transaction?.includes('/api/metrics')) {
      return null;
    }
    return event;
  },
  
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry event intercepted (dev mode):', event);
      return null;
    }
    
    // Filter sensitive data
    if (event.exception) {
      event.exception.values?.forEach(exception => {
        if (exception.stacktrace) {
          exception.stacktrace.frames?.forEach(frame => {
            // Remove sensitive environment variables
            if (frame.vars) {
              Object.keys(frame.vars).forEach(key => {
                if (key.toLowerCase().includes('key') || 
                    key.toLowerCase().includes('secret') ||
                    key.toLowerCase().includes('token')) {
                  frame.vars![key] = '[Filtered]';
                }
              });
            }
          });
        }
      });
    }
    
    // Add custom tags
    event.tags = {
      ...event.tags,
      component: 'server',
      nodeVersion: process.version,
    };
    
    // Add user context if available
    if (event.request?.headers) {
      const userAgent = event.request.headers['user-agent'];
      if (userAgent) {
        event.contexts = {
          ...event.contexts,
          browser: {
            name: userAgent,
            version: 'unknown'
          }
        };
      }
    }
    
    return event;
  },
  
  // Error filtering
  ignoreErrors: [
    // Network errors
    'NetworkError',
    'ChunkLoadError',
    'Loading chunk',
    'AbortError',
    // User agent errors
    'Non-Error promise rejection captured',
    // Rate limiting
    'Too Many Requests',
    // Development artifacts
    'ResizeObserver loop limit exceeded',
  ],
  
  // Custom fingerprinting for better error grouping
  beforeBreadcrumb(breadcrumb) {
    // Filter sensitive breadcrumbs
    if (breadcrumb.category === 'console' && 
        breadcrumb.message?.includes('password')) {
      return null;
    }
    
    // Enhance API breadcrumbs
    if (breadcrumb.category === 'fetch') {
      breadcrumb.data = {
        ...breadcrumb.data,
        timestamp: new Date().toISOString(),
      };
    }
    
    return breadcrumb;
  },
});