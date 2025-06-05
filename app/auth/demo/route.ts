import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Use environment variables for demo credentials
    const demoEmail = process.env.DEMO_USER_EMAIL || 'demo@zenyaai.com'
    const demoPassword = process.env.DEMO_USER_PASSWORD
    
    if (!demoPassword) {
      // Demo password not configured
      return NextResponse.redirect(new URL('/auth?error=demo-not-configured', process.env.NEXT_PUBLIC_APP_URL!))
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    })

    if (error) {
      // If demo user doesn't exist, create it
      const { error: signUpError } = await supabase.auth.signUp({
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
      const { error: newSignInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (newSignInError) {
        return NextResponse.redirect(new URL('/auth?error=demo-failed', process.env.NEXT_PUBLIC_APP_URL!))
      }
    }

    // Redirect to home page after successful demo login
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL!))
  } catch (_error) {
    // Error will be monitored by error tracking service
    return NextResponse.redirect(new URL('/auth?error=demo-failed', process.env.NEXT_PUBLIC_APP_URL!))
  }
}
