import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Release Health
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  environment: process.env.NODE_ENV,
  
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry event intercepted (dev mode):', event);
      return null;
    }
    return event;
  },
});