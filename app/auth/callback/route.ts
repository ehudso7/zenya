import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  // Handle OAuth errors from Supabase
  if (error) {
    // Error will be monitored by error tracking service
    return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=invalid-code`)
  }

  const supabase = await createServerSupabaseClient()
  
  try {
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      // Error will be monitored by error tracking service
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=invalid-code`)
    }

    // Check if user exists in our database
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Always redirect to /learn after email confirmation
      return NextResponse.redirect(`${requestUrl.origin}/learn`)
    }
  } catch (_error) {
    // Error will be monitored by error tracking service
    return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=server-error`)
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/learn`)
}