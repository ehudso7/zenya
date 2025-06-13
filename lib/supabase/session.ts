/**
 * Session management utilities for Supabase auth
 */

import { Session, User } from '@supabase/supabase-js'
import { createClient } from './client'

// Use the singleton client from client.ts
function getSupabaseClient() {
  return createClient()
}

/**
 * Get current session with automatic refresh
 */
export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      // Try to refresh session
      const { data: refreshData } = await supabase.auth.refreshSession()
      return refreshData.session
    }
    
    // Check if session is about to expire (within 5 minutes)
    if (session && session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000)
      const now = new Date()
      const timeUntilExpiry = expiresAt.getTime() - now.getTime()
      
      if (timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes
        // Proactively refresh the session
        const { data: refreshData } = await supabase.auth.refreshSession()
        return refreshData.session
      }
    }
    
    return session
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

/**
 * Get current user with session validation
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user || null
}

/**
 * Sign out and clear all sessions
 */
export async function signOut() {
  const supabase = getSupabaseClient()
  
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      // Don't force clear - let Supabase handle it
    }
    
    return { success: true }
  } catch (error) {
    console.error('Failed to sign out:', error)
    return { success: false, error }
  }
}

/**
 * Set up session recovery on page load
 */
export function setupSessionRecovery() {
  if (typeof window === 'undefined') return
  
  const supabase = getSupabaseClient()
  
  // Listen for auth state changes
  supabase.auth.onAuthStateChange(async (event: any, _session: any) => {
    if (event === 'TOKEN_REFRESHED') {
      // Session token refreshed successfully
    }
    // Don't call signOut on SIGNED_OUT event - it's already signed out
  })
  
  // Check session on visibility change
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      // Page became visible, check session
      await getSession()
    }
  })
  
  // Check session on focus
  window.addEventListener('focus', async () => {
    await getSession()
  })
  
  // Periodic session check (every 5 minutes)
  setInterval(async () => {
    await getSession()
  }, 5 * 60 * 1000)
}