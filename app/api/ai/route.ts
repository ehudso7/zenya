import { NextRequest, NextResponse } from 'next/server'
import { generateSmartResponse, getProviderStats } from '@/lib/ai/provider-manager'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Mood } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { message, mood, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Use smart provider selection with load balancing
    const response = await generateSmartResponse(
      message,
      mood as Mood | null,
      context
    )

    // Log provider usage for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.log('Provider stats:', getProviderStats())
    }

    return NextResponse.json(response)
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('AI API error:', error)
    }
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}