'use client'

import { useEffect } from 'react'
import { useDailyReset } from '@/hooks/use-daily-reset'
import { usePreferences } from '@/hooks/use-preferences'
import { DebugInitializer } from './debug-initializer'

/**
 * Client component that initializes app-level hooks
 * This ensures daily XP resets and preferences are applied globally
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  // Initialize daily reset logic
  useDailyReset()
  
  // Initialize and apply user preferences
  usePreferences()
  
  // App initialization complete
  useEffect(() => {
    // Daily reset and preferences are now active
  }, [])
  
  return (
    <>
      <DebugInitializer />
      {children}
    </>
  )
}