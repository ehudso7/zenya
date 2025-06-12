/**
 * Session management utilities for Supabase auth
 */

import { createBrowserClient } from '@supabase/ssr'
import { Session, User } from '@supabase/supabase-js'

// Create a singleton Supabase client for session management
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
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
      // Force clear session
      await supabase.auth.admin?.signOut()
    }
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Clear local storage
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase')
      )
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Clear session storage
      const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase')
      )
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))
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
      console.warn('Session token refreshed')
    } else if (event === 'SIGNED_OUT') {
      // Ensure complete cleanup
      await signOut()
    }
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