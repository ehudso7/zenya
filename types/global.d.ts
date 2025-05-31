import * as Sentry from '@sentry/nextjs'

declare global {
  interface Window {
    Sentry: typeof Sentry
  }
}

export {}