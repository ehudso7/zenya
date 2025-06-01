import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Create a demo user session (for testing purposes)
    const demoEmail = 'demo@zenyaai.com'
    const demoPassword = 'demo-password-2025'
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    })

    if (error) {
      // If demo user doesn't exist, create it
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            name: 'Demo User',
          },
        },
      })

      if (signUpError) {
        return NextResponse.redirect(new URL('/auth?error=demo-failed', process.env.NEXT_PUBLIC_APP_URL!))
      }

      // Sign in the newly created demo user
      const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (newSignInError) {
        return NextResponse.redirect(new URL('/auth?error=demo-failed', process.env.NEXT_PUBLIC_APP_URL!))
      }
    }

    // Redirect to home page after successful demo login
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL!))
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Demo login error:', error)
    }
    return NextResponse.redirect(new URL('/auth?error=demo-failed', process.env.NEXT_PUBLIC_APP_URL!))
  }
}