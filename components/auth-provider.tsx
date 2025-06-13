'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const setUser = useStore(state => state.setUser)
  const supabase = createClient()
  const isInitialized = useRef(false)

  useEffect(() => {
    // Prevent double initialization
    if (isInitialized.current) return
    isInitialized.current = true

    // Function to fetch and sync user profile
    const syncUserProfile = async (_userId: string) => {
      try {
        const response = await fetch('/api/profile', {
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        
        if (response.ok) {
          const { user: profile } = await response.json()
          if (profile) {
            setUser({
              id: profile.user_id,
              email: profile.email || '',
              name: profile.name || '',
              avatar_url: profile.avatar_url || '',
              created_at: profile.created_at,
              current_xp: profile.current_xp || 0,
              level: profile.level || 1,
              streak_count: profile.streak_count || 0,
              learning_streak: profile.learning_streak || 0,
              total_lessons_completed: profile.total_lessons_completed || 0,
              mood: profile.mood || null,
              learning_preferences: {
                difficulty_level: profile.learning_preferences?.difficulty_level || 'beginner',
                learning_style: profile.learning_preferences?.learning_style || 'visual',
                session_duration: profile.learning_preferences?.session_duration || 15,
                daily_goal: profile.learning_preferences?.daily_goal || 30,
                topics_of_interest: profile.learning_preferences?.topics_of_interest || [],
                time_zone: profile.learning_preferences?.time_zone || 'UTC',
                mood: profile.learning_preferences?.mood || 'focused',
              },
              profile_completed: profile.profile_completed || false,
            })
          }
        } else if (response.status === 401) {
          // User is not authenticated
          setUser(null)
        }
      } catch (_error) {
        // Silent fail - profile sync will retry
      }
    }

    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          await syncUserProfile(session.user.id)
        } else {
          setUser(null)
        }
      } catch (_error) {
        // Silent fail on session check
        setUser(null)
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      // Log auth state changes for debugging
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Auth state change:', event)
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        await syncUserProfile(session.user.id)
        
        // Only show success message and redirect for initial sign in
        if (event === 'SIGNED_IN') {
          toast.success('Welcome back!')
          
          // Redirect to appropriate page
          const currentPath = window.location.pathname
          if (currentPath.startsWith('/auth') || currentPath === '/landing' || currentPath === '/') {
            const profileResponse = await fetch('/api/profile')
            if (profileResponse.ok) {
              const { user: profile } = await profileResponse.json()
              if (!profile?.profile_completed) {
                router.push('/profile?onboarding=true')
              } else {
                router.push('/learn')
              }
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        // Don't show toast here - it's handled by the logout button
        
        // Redirect to landing if on protected page
        const currentPath = window.location.pathname
        const publicPaths = ['/', '/landing', '/about', '/faq', '/contact', '/privacy', '/terms']
        if (!publicPaths.includes(currentPath) && !currentPath.startsWith('/auth')) {
          router.push('/landing')
        }
      } else if ((event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
        // Silently sync profile on token refresh or user update
        await syncUserProfile(session.user.id)
      }
    })

    // Check session on mount
    checkSession()
    
    // Initialize CSRF token with retry
    const initCSRF = async () => {
      try {
        const response = await fetch('/api/csrf', {
          credentials: 'include',
          cache: 'no-cache'
        })
        
        if (!response.ok) {
          console.warn('Failed to initialize CSRF token:', response.status)
          // Retry after 1 second
          setTimeout(initCSRF, 1000)
        }
      } catch (error) {
        console.warn('CSRF initialization error:', error)
        // Retry after 2 seconds
        setTimeout(initCSRF, 2000)
      }
    }
    
    initCSRF()

    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [router, setUser, supabase])

  // Periodically sync user data (every 5 minutes)
  useEffect(() => {
    const user = useStore.getState().user
    if (!user) return

    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        try {
          const response = await fetch('/api/profile')
          if (response.ok) {
            const { user: profile } = await response.json()
            if (profile) {
              // Update XP and streak without overwriting everything
              setUser({
                ...useStore.getState().user!,
                current_xp: profile.current_xp || 0,
                level: profile.level || 1,
                learning_streak: profile.learning_streak || 0,
                total_lessons_completed: profile.total_lessons_completed || 0,
              })
            }
          }
        } catch (_error) {
          // Silently fail - this is just a background sync
        }
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [supabase, setUser])

  return <>{children}</>
}