import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Demo account credentials from environment variables
const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@zenyaai.com'
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || process.env.DEMO_ACCOUNT_PASSWORD || 'DemoUser2025!'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const supabase = await createServerSupabaseClient()
  
  try {
    // First, try to sign in with existing demo account
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })
    
    if (signInData.user) {
      // Demo account exists and signed in successfully
      return NextResponse.redirect(`${requestUrl.origin}/learn`)
    }
    
    // If sign in failed, try to create demo account
    if (signInError) {
      console.warn('Demo account sign in failed, attempting to create...')
      
      // Create demo account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        options: {
          data: {
            full_name: 'Demo User',
            is_demo: true,
            demo_account: true,
          },
          emailRedirectTo: `${requestUrl.origin}/auth/callback`,
        }
      })
      
      if (signUpError) {
        console.error('Failed to create demo account:', signUpError)
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=demo-setup-failed`)
      }
      
      if (signUpData.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try to sign in again
        const { data: finalSignIn, error: _finalError } = await supabase.auth.signInWithPassword({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        })
        
        if (finalSignIn.user) {
          // Ensure profile is set up correctly
          await supabase
            .from('users')
            .upsert({
              id: finalSignIn.user.id,
              email: DEMO_EMAIL,
              name: 'Demo User',
              onboarding_completed: true,
              profile_completed: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          
          return NextResponse.redirect(`${requestUrl.origin}/learn`)
        }
      }
    }
    
    // If we get here, something went wrong
    return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=demo-failed`)
    
  } catch (error) {
    console.error('Demo sign in error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=demo-error`)
  }
}