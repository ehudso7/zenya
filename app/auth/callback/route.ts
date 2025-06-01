import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors from Supabase
  if (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth error:', error, errorDescription)
    }
    return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=invalid-code`)
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      // Log error for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.error('Session exchange error:', sessionError)
      }
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=invalid-code`)
    }

    // Check if user exists in our database
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if this is their first login
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      // Redirect based on onboarding status
      if (profile?.onboarding_completed) {
        return NextResponse.redirect(`${requestUrl.origin}/learn`)
      } else {
        return NextResponse.redirect(`${requestUrl.origin}/profile`)
      }
    }
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in auth callback:', error)
    }
    return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=server-error`)
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/learn`)
}