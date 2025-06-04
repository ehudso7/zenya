'use client'

import { useEffect, useState } from 'react'

interface SRAnnouncerProps {
  message: string
  priority?: 'polite' | 'assertive'
}

/**
 * Screen Reader Announcer Component
 * Announces messages to screen readers without visual display
 */
export function SRAnnouncer({ message, priority = 'polite' }: SRAnnouncerProps) {
  const [announcement, setAnnouncement] = useState('')
  
  useEffect(() => {
    if (message) {
      // Clear and re-set to ensure announcement is made
      setAnnouncement('')
      const timer = setTimeout(() => {
        setAnnouncement(message)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [message])
  
  return (
    <div 
      className="sr-only" 
      role="status" 
      aria-live={priority}
      aria-atomic="true"
    >
      {announcement}
    </div>
  )
}

/**
 * Hook for programmatic screen reader announcements
 */
export function useSRAnnouncer() {
  const announce = (text: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create a temporary element for the announcement
    const announcer = document.createElement('div')
    announcer.setAttribute('role', 'status')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    
    document.body.appendChild(announcer)
    
    // Announce after a short delay to ensure it's picked up
    setTimeout(() => {
      announcer.textContent = text
    }, 100)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }
  
  return { announce }
}