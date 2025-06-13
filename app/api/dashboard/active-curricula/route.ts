import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
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

    // Get all curricula with user progress
    const { data: curricula, error: curriculaError } = await supabase
      .from('curriculums')
      .select(`
        id,
        title,
        slug,
        estimated_hours,
        lessons (
          id,
          title,
          order_index,
          user_progress!left (
            status,
            completed_at,
            last_accessed_at
          )
        )
      `)
      .eq('is_active', true)
      .eq('is_published', true)
      .order('title')

    if (curriculaError) {
      console.error('Curricula fetch error:', curriculaError)
      return NextResponse.json(
        { error: 'Failed to fetch curricula' },
        { status: 500 }
      )
    }

    // Process curricula to find active ones (user has started)
    const activeCurricula = curricula
      ?.map(curriculum => {
        // Get user's progress for this curriculum
        const userLessons = curriculum.lessons?.filter(lesson => 
          lesson.user_progress?.some((p: any) => p.user_id === user.id)
        ) || []

        // Calculate progress
        const totalLessons = curriculum.lessons?.length || 0
        const completedLessons = curriculum.lessons?.filter(lesson =>
          lesson.user_progress?.some((p: any) => 
            p.user_id === user.id && p.status === 'completed'
          )
        ).length || 0

        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

        // Find last accessed date
        const lastAccessDates = userLessons
          .map(lesson => lesson.user_progress?.[0]?.last_accessed_at)
          .filter(Boolean)
          .map(date => new Date(date))

        const lastAccessed = lastAccessDates.length > 0 
          ? new Date(Math.max(...lastAccessDates.map(d => d.getTime())))
          : null

        // Find next incomplete lesson
        const nextLesson = curriculum.lessons
          ?.sort((a: any, b: any) => a.order_index - b.order_index)
          .find(lesson => 
            !lesson.user_progress?.some((p: any) => 
              p.user_id === user.id && p.status === 'completed'
            )
          )

        return {
          id: curriculum.id,
          title: curriculum.title,
          slug: curriculum.slug,
          progress,
          lastAccessed: lastAccessed?.toISOString() || null,
          nextLesson: nextLesson?.title || null,
          totalLessons,
          completedLessons,
          isActive: userLessons.length > 0
        }
      })
      .filter(curriculum => curriculum.isActive)
      .sort((a, b) => {
        // Sort by last accessed (most recent first)
        if (a.lastAccessed && b.lastAccessed) {
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
        }
        return 0
      })
      .slice(0, 5) // Return top 5 active curricula

    return NextResponse.json({
      curricula: activeCurricula
    })
  } catch (error) {
    console.error('Active curricula error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}