import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/api-middleware'
import { lessonProgressSchema } from '@/lib/validations'
import { validateRequest } from '@/lib/validation-middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  return withRateLimit(request, async (req) => {
    const { lessonId } = await params
    const { searchParams } = new URL(req.url)
    const mood = searchParams.get('mood') || 'neutral'
    
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
      const progress = lesson.user_progress?.find((p: { user_id: string }) => p.user_id === user.id) || {
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

        // Create AI interaction for adaptive learning
        await supabase.from('ai_interactions').insert({
          user_id: user.id,
          lesson_id: lessonId,
          curriculum_id: lesson.curriculum_id,
          message: 'Started lesson',
          mood: mood,
          interaction_type: 'lesson_start',
          context: { user_mood: mood }
        })
      }

      // Adapt content based on mood
      let adaptedContent = lesson.content
      let adaptedContentBlocks = lesson.content_blocks

      // Mood-based content adaptations
      const moodAdaptations = {
        excited: {
          prefix: "🚀 Let's dive right in! ",
          pacing: 'fast',
          style: 'energetic',
          extraContent: "\n\n💪 Challenge: Try to complete this lesson in record time!"
        },
        happy: {
          prefix: "😊 Great to see you in high spirits! ",
          pacing: 'moderate',
          style: 'positive',
          extraContent: "\n\n✨ Fun fact: Learning while happy improves retention by up to 30%!"
        },
        curious: {
          prefix: "🔍 Let's explore this topic together! ",
          pacing: 'detailed',
          style: 'exploratory',
          extraContent: "\n\n🤔 Think about: How does this connect to what you already know?"
        },
        focused: {
          prefix: "🎯 Perfect mindset for deep learning. ",
          pacing: 'structured',
          style: 'precise',
          extraContent: "\n\n📝 Pro tip: Take notes to maximize your focused state."
        },
        relaxed: {
          prefix: "🌊 Let's take this at a comfortable pace. ",
          pacing: 'slow',
          style: 'gentle',
          extraContent: "\n\n🧘 Remember: There's no rush. Understanding is more important than speed."
        }
      }

      const adaptation = moodAdaptations[mood as keyof typeof moodAdaptations] || {
        prefix: "",
        pacing: 'moderate',
        style: 'standard',
        extraContent: ""
      }

      // Apply mood adaptations to content
      if (adaptation.prefix) {
        adaptedContent = adaptation.prefix + adaptedContent + adaptation.extraContent
      }

      // Adapt content blocks if they exist
      if (adaptedContentBlocks && Array.isArray(adaptedContentBlocks)) {
        adaptedContentBlocks = adaptedContentBlocks.map((block: any, index: number) => {
          if (index === 0 && block.type === 'text') {
            return {
              ...block,
              content: adaptation.prefix + block.content
            }
          }
          return block
        })

        // Add mood-specific content block at the end
        if (adaptation.extraContent) {
          adaptedContentBlocks.push({
            type: 'text',
            content: adaptation.extraContent
          })
        }
      }

      return NextResponse.json({ 
        lesson: {
          ...lesson,
          content: adaptedContent,
          content_blocks: adaptedContentBlocks,
          user_progress: progress,
          mood_adaptation: {
            mood: mood,
            pacing: adaptation.pacing,
            style: adaptation.style
          }
        }
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=0, must-revalidate',
          'CDN-Cache-Control': 'private, max-age=0',
        }
      })
    } catch (_error) {
      // Error will be monitored by error tracking service
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }, 'api')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  return withRateLimit(request, async (req) => {
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

      // Check if action is complete
      const body = await req.json()
      if (body.action === 'complete') {
        // Validate request body for lesson progress
        const { data, error: validationError } = await validateRequest(
          new Request(req.url, {
            method: 'POST',
            headers: req.headers,
            body: JSON.stringify({
              timeSpent: body.timeSpent || 0,
              mood: body.mood || null,
              completed: true
            })
          }) as NextRequest,
          lessonProgressSchema
        )
        
        if (validationError) {
          return validationError
        }

        const { timeSpent, mood } = data!
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
            time_spent_seconds: timeSpent || 0,
            mood: mood
          })

        if (progressError) {
          // Error will be monitored by error tracking service
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
    } catch (_error) {
      // Error will be monitored by error tracking service
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }, 'api')
}