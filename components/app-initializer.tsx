'use client'

import { useEffect } from 'react'
import { useDailyReset } from '@/hooks/use-daily-reset'
import { usePreferences } from '@/hooks/use-preferences'

/**
 * Client component that initializes app-level hooks
 * This ensures daily XP resets and preferences are applied globally
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  // Initialize daily reset logic
  useDailyReset()
  
  // Initialize and apply user preferences
  usePreferences()
  
  // Log initialization for debugging
  useEffect(() => {
    console.log('App initializer mounted - daily reset and preferences active')
  }, [])
  
  return <>{children}</>
}