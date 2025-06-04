import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/api-middleware'
import { paginationSchema } from '@/lib/validations'
import { validateQueryParams } from '@/lib/validation-middleware'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    try {
      const supabase = await createServerSupabaseClient()
      const { searchParams } = new URL(req.url)
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

      // Validate pagination parameters
      const { data: paginationParams, error: validationError } = await validateQueryParams(req, paginationSchema)
      
      if (validationError) {
        return validationError
      }

      // Use default values if validation failed
      const page = paginationParams?.page ?? 1
      const limit = paginationParams?.limit ?? 10
      const sortBy = paginationParams?.sortBy
      const sortOrder = paginationParams?.sortOrder ?? 'desc'
      const offset = (page - 1) * limit

      // Fetch lessons for the curriculum with user progress
      let query = supabase
      .from('lessons')
      .select(`
        *,
        user_progress!left (
          status,
          completed_at,
          xp_earned
        )
      `, { count: 'exact' })
      .eq('curriculum_id', curriculumId)
      .eq('is_active', true)

      // Apply sorting
      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      } else {
        query = query.order('order_index')
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data: lessons, error: lessonsError, count } = await query

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
        const progress = lesson.user_progress?.find((p: { user_id: string }) => p.user_id === user.id)
        return {
          ...lesson,
          user_progress: progress || { status: 'not_started', completed_at: null, xp_earned: 0 }
        }
      })

      return NextResponse.json(
        { 
          lessons: lessonsWithProgress,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          }
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
            'CDN-Cache-Control': 'private, max-age=60',
          }
        }
      )
  } catch (_error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Lessons API error:', _error)
    }
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }, 'api')
}