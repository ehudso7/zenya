import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const curriculumId = searchParams.get('curriculumId')

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!curriculumId) {
      return NextResponse.json(
        { error: 'Curriculum ID is required' },
        { status: 400 }
      )
    }

    // Fetch lessons for the curriculum with user progress
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        *,
        user_progress!left (
          status,
          completed_at,
          xp_earned
        )
      `)
      .eq('curriculum_id', curriculumId)
      .eq('is_active', true)
      .order('order_index')

    if (lessonsError) {
      // Log error for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching lessons:', lessonsError)
      }
      return NextResponse.json(
        { error: 'Failed to fetch lessons' },
        { status: 500 }
      )
    }

    // Transform the data to include progress info
    const lessonsWithProgress = lessons.map(lesson => {
      const progress = lesson.user_progress?.find((p: any) => p.user_id === user.id)
      return {
        ...lesson,
        user_progress: progress || { status: 'not_started', completed_at: null, xp_earned: 0 }
      }
    })

    return NextResponse.json({ lessons: lessonsWithProgress })
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Lessons API error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}