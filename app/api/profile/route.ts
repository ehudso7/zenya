import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('*, user_preferences(*)')
      .eq('id', session.user.id)
      .single()

    if (error) {
      // Log error for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching profile:', error)
      }
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Profile GET error:', error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, learning_style, timezone, notification_preferences } = body

    const { data: profile, error } = await supabase
      .from('users')
      .update({
        name,
        bio,
        learning_style,
        timezone,
        notification_preferences,
        onboarding_completed: true
      })
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) {
      // Log error for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating profile:', error)
      }
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Profile PUT error:', error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}