import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { withRateLimit } from '@/lib/api-middleware'

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    try {
      // Add CORS headers for API routes
      const responseHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
      
      const supabase = createRouteHandlerClient({ cookies })
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        return NextResponse.json({ 
          error: 'Authentication required',
          message: 'Please sign in to access practice mode' 
        }, { status: 401 })
      }
      
      const user = session.user

      const body = await req.json()
      const { lessonId, curriculumId, action } = body

      if (!lessonId || !curriculumId) {
        return NextResponse.json({ 
          error: 'Missing required fields',
          message: 'Lesson ID and Curriculum ID are required' 
        }, { status: 400 })
      }

      // For now, just record that practice mode was activated
      // In the future, this would handle practice exercises, quizzes, etc.
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          curriculum_id: curriculumId,
          interaction_type: 'practice_mode',
          metadata: {
            action: action || 'start',
            timestamp: new Date().toISOString(),
            mood: body.mood
          }
        })

      if (error) {
        console.error('Error recording practice interaction:', error)
        // Don't fail the request, just log the error
      }

      return NextResponse.json({
        success: true,
        message: 'Practice mode activated',
        practiceData: {
          lessonId,
          curriculumId,
          // In the future, this would include practice exercises
          exercises: [],
          quizzes: []
        }
      }, { headers: responseHeaders })
    } catch (error) {
      console.error('Practice mode error:', error)
      return NextResponse.json({ 
        error: 'Internal server error',
        message: 'Failed to activate practice mode' 
      }, { status: 500 })
    }
  }, 'api')
}

export async function OPTIONS(_req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  })
}

export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        return NextResponse.json({ 
          error: 'Authentication required' 
        }, { status: 401 })
      }
      
      // User is authenticated at this point
      // const user = session.user // Will be used when fetching user-specific practice content

      const { searchParams } = new URL(req.url)
      const lessonId = searchParams.get('lessonId')
      const curriculumId = searchParams.get('curriculumId')

      if (!lessonId || !curriculumId) {
        return NextResponse.json({ 
          error: 'Missing required parameters' 
        }, { status: 400 })
      }

      // Placeholder for practice content
      // In the future, this would fetch actual practice exercises
      return NextResponse.json({
        success: true,
        practice: {
          lessonId,
          curriculumId,
          exercises: [],
          quizzes: [],
          flashcards: []
        }
      })
    } catch (error) {
      console.error('Practice fetch error:', error)
      return NextResponse.json({ 
        error: 'Internal server error' 
      }, { status: 500 })
    }
  }, 'api')
}