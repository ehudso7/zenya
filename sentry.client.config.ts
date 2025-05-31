import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in development, reduce in production
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  
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
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});