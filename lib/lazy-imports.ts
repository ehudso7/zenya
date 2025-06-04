// Lazy import utilities for performance optimization

import dynamic from 'next/dynamic'

// Lazy load heavy animation libraries
export const lazyFramerMotion = () => import('framer-motion')

// Create dynamic components with loading states
export const createDynamicComponent = <T extends object>(
  loader: () => Promise<{ default: React.ComponentType<T> }>,
  loadingComponent?: () => React.ReactNode
) => {
  return dynamic(loader, {
    loading: loadingComponent,
    ssr: false,
  })
}

// Utility to preload components on hover/focus
export const preloadComponent = (loader: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      loader()
    }, 1000)
  }
}