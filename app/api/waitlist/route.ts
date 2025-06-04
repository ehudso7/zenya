import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/api-middleware'
import { waitlistSchema } from '@/lib/validations'
import { validateRequest } from '@/lib/validation-middleware'

export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    try {
      // Validate request body
      const { data, error: validationError } = await validateRequest(req, waitlistSchema)
      
      if (validationError) {
        return validationError
      }

      const { email, reason } = data!
      const source = reason || 'landing'

      const supabase = await createServerSupabaseClient()

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Add to waitlist
    const { error } = await supabase
      .from('waitlist')
      .insert({ email, source })

    if (error) {
      // Log error for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.error('Waitlist insert error:', error)
      }
      return NextResponse.json(
        { error: 'Failed to add to waitlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Waitlist API error:', error)
    }
      return NextResponse.json(
        { error: 'Server error' },
        { status: 500 }
      )
    }
  }, 'waitlist')
}