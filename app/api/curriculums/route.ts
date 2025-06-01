import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Fetch all active curriculums
    const { data: curriculums, error } = await supabase
      .from('curriculums')
      .select('*')
      .eq('is_active', true)
      .order('title')

    if (error) {
      // Log error for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching curriculums:', error)
      }
      return NextResponse.json(
        { error: 'Failed to fetch curriculums' },
        { status: 500 }
      )
    }

    return NextResponse.json({ curriculums })
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Curriculums API error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}