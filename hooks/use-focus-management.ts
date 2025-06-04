import { useEffect, useRef } from 'react'

/**
 * Custom hook for managing focus after route changes
 * Ensures proper focus management for keyboard navigation
 */
export function useFocusManagement(elementId?: string) {
  const focusRef = useRef<HTMLElement | null>(null)
  
  useEffect(() => {
    // Focus the main content area or specified element after route changes
    const targetId = elementId || 'main-content'
    const element = document.getElementById(targetId)
    
    if (element) {
      // Store current focus
      focusRef.current = document.activeElement as HTMLElement
      
      // Set tabindex if not already set
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1')
      }
      
      // Focus the element
      element.focus()
      
      // Remove tabindex after focus to maintain natural tab order
      if (element.getAttribute('tabindex') === '-1') {
        element.removeAttribute('tabindex')
      }
    }
    
    // Cleanup function
    return () => {
      // Return focus to previous element if it still exists
      if (focusRef.current && document.contains(focusRef.current)) {
        focusRef.current.focus()
      }
    }
  }, [elementId])
}

/**
 * Hook for trapping focus within a modal or dialog
 */
export function useFocusTrap(isOpen: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return
    
    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement
    
    // Focus first element when trap activates
    firstFocusable?.focus()
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }
    
    container.addEventListener('keydown', handleKeyDown)
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, containerRef])
}

/**
 * Hook for managing focus return after modal/dialog closes
 */
export function useFocusReturn() {
  const previousFocusRef = useRef<HTMLElement | null>(null)
  
  const storeFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }
  
  const restoreFocus = () => {
    if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus()
    }
  }
  
  return { storeFocus, restoreFocus }
}