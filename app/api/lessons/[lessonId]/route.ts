import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the lesson with user progress
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        *,
        curriculum:curriculums(*),
        user_progress!left (
          status,
          completed_at,
          xp_earned,
          time_spent_seconds
        )
      `)
      .eq('id', lessonId)
      .eq('is_active', true)
      .single()

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Get user's progress for this lesson
    const progress = lesson.user_progress?.find((p: any) => p.user_id === user.id) || {
      status: 'not_started',
      completed_at: null,
      xp_earned: 0,
      time_spent_seconds: 0
    }

    // Start a learning session if not already started
    if (progress.status === 'not_started') {
      await supabase.from('user_progress').upsert({
        user_id: user.id,
        lesson_id: lessonId,
        curriculum_id: lesson.curriculum_id,
        status: 'in_progress',
        started_at: new Date().toISOString()
      })

      // Create a learning session
      await supabase.from('user_sessions').insert({
        user_id: user.id,
        lesson_id: lessonId,
        started_at: new Date().toISOString()
      })
    }

    return NextResponse.json({ 
      lesson: {
        ...lesson,
        user_progress: progress
      }
    })
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Lesson API error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  
  try {
    const supabase = await createServerSupabaseClient()
    const { action, timeSpent, mood } = await request.json()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (action === 'complete') {
      // Get the lesson to know the XP reward
      const { data: lesson } = await supabase
        .from('lessons')
        .select('xp_reward, curriculum_id')
        .eq('id', lessonId)
        .single()

      if (!lesson) {
        return NextResponse.json(
          { error: 'Lesson not found' },
          { status: 404 }
        )
      }

      // Update user progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          curriculum_id: lesson.curriculum_id,
          status: 'completed',
          completed_at: new Date().toISOString(),
          xp_earned: lesson.xp_reward,
          time_spent_seconds: timeSpent || 0
        })

      if (progressError) {
        // Log error for monitoring
        if (process.env.NODE_ENV === 'development') {
          console.error('Error updating progress:', progressError)
        }
        return NextResponse.json(
          { error: 'Failed to update progress' },
          { status: 500 }
        )
      }

      // Update user's total XP
      const { data: currentUser } = await supabase
        .from('users')
        .select('total_xp')
        .eq('id', user.id)
        .single()

      const newTotalXp = (currentUser?.total_xp || 0) + lesson.xp_reward

      await supabase
        .from('users')
        .update({ 
          total_xp: newTotalXp,
          last_active_at: new Date().toISOString()
        })
        .eq('id', user.id)

      // Check for achievements
      const achievements = []
      
      // First lesson completed
      const { data: completedCount } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')

      if (completedCount?.length === 1) {
        achievements.push({
          user_id: user.id,
          achievement_type: 'first_lesson',
          achievement_name: 'First Steps',
          description: 'Completed your first lesson!',
          xp_bonus: 50
        })
      }

      // Insert achievements if any
      if (achievements.length > 0) {
        await supabase.from('user_achievements').insert(achievements)
      }

      return NextResponse.json({ 
        success: true, 
        xp_earned: lesson.xp_reward,
        total_xp: newTotalXp,
        achievements 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Lesson completion error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}