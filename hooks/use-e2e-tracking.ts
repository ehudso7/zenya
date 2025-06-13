import { useEffect } from 'react'
import { debugLogger } from '@/lib/debug-logger'

// E2E Testing hook to track all interactions
export function useE2ETracking(componentName: string) {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return

    const trackEvent = (eventType: string, detail: any) => {
      debugLogger.user(`${componentName}:${eventType}`, detail)
      
      // Also send to E2E endpoint for specialized tracking
      fetch('/api/debug/e2e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: eventType,
          testName: componentName,
          data: detail
        })
      }).catch(() => {
        // Silent fail
      })
    }

    // Track component mount
    trackEvent('mount', { timestamp: new Date().toISOString() })

    // Track clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      trackEvent('click', {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        text: target.textContent?.substring(0, 50)
      })
    }

    // Track form submissions
    const handleSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement
      trackEvent('form-submit', {
        formId: form.id,
        formAction: form.action,
        method: form.method
      })
    }

    // Track input changes
    const handleInput = (e: Event) => {
      const input = e.target as HTMLInputElement
      trackEvent('input', {
        inputName: input.name,
        inputType: input.type,
        inputId: input.id,
        valueLength: input.value.length
      })
    }

    // Track navigation
    const handleNavigation = () => {
      trackEvent('navigation', {
        path: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
      })
    }

    // Add event listeners
    document.addEventListener('click', handleClick, true)
    document.addEventListener('submit', handleSubmit, true)
    document.addEventListener('input', handleInput, true)
    window.addEventListener('popstate', handleNavigation)

    // Track initial navigation
    handleNavigation()

    return () => {
      // Track component unmount
      trackEvent('unmount', { timestamp: new Date().toISOString() })
      
      // Remove event listeners
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('submit', handleSubmit, true)
      document.removeEventListener('input', handleInput, true)
      window.removeEventListener('popstate', handleNavigation)
    }
  }, [componentName])
}