export async function register() {
  // Initialize OpenTelemetry tracing first
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import and initialize tracing
    const { initializeTracing } = await import('./lib/monitoring/tracing')
    initializeTracing()
  }

  // Only enable Sentry in production to avoid development noise
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config')
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config')
    }
  }
}