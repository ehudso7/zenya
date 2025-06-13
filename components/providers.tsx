'use client'

import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from './error-boundary'
import { AuthProvider } from './auth-provider'
import { ServiceWorkerManager } from './service-worker-manager'
import { ClientErrorLogger } from './client-error-logger'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ServiceWorkerManager />
        <ClientErrorLogger />
        {children}
      </AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ErrorBoundary>
  )
}