import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/api-middleware'
import { adaptiveLearning } from '@/lib/ml/adaptive-learning'
import { tracing } from '@/lib/monitoring/tracing'

// Record learning event
export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    return tracing.traceOperation(
      'adaptive_learning_record',
      async (span) => {
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

          const body = await req.json()
          const {
            sessionId,
            lessonId,
            conceptId,
            timeSpent,
            attemptsCount,
            successRate,
            confidenceLevel,
            difficultyRating,
            mood,
            energyLevel,
            focusLevel,
            stressLevel,
            deviceType,
            completed,
            comprehension,
            retention,
            satisfaction
          } = body

          // Validate required fields
          if (!sessionId || !lessonId || !conceptId || timeSpent === undefined) {
            return NextResponse.json(
              { error: 'Missing required fields' },
              { status: 400 }
            )
          }

          // Create learning data point
          const dataPoint = {
            userId: user.id,
            sessionId,
            lessonId,
            conceptId,
            timestamp: Date.now(),
            timeSpent: Number(timeSpent),
            attemptsCount: Number(attemptsCount) || 1,
            successRate: Number(successRate) || 0,
            confidenceLevel: Number(confidenceLevel) || 0.5,
            difficultyRating: Number(difficultyRating) || 5,
            mood: mood || 'neutral',
            energyLevel: Number(energyLevel) || 0.5,
            focusLevel: Number(focusLevel) || 0.5,
            stressLevel: Number(stressLevel) || 0.5,
            timeOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
            deviceType: deviceType || 'desktop',
            completed: Boolean(completed),
            comprehension: Number(comprehension) || 0,
            retention: Number(retention) || 0,
            satisfaction: Number(satisfaction) || 0.5
          }

          span.setAttributes({
            'learning.user_id': user.id,
            'learning.session_id': sessionId,
            'learning.lesson_id': lessonId,
            'learning.concept_id': conceptId,
            'learning.success_rate': dataPoint.successRate,
            'learning.time_spent': dataPoint.timeSpent,
            'learning.completed': dataPoint.completed
          })

          // Record the learning event
          await adaptiveLearning.recordLearningEvent(dataPoint)

          // Generate recommendations
          const recommendations = await adaptiveLearning.generateRecommendations(user.id)

          // Get updated profile
          const profile = adaptiveLearning.getUserProfile(user.id)
          const analytics = adaptiveLearning.getLearningAnalytics(user.id)

          return NextResponse.json({
            success: true,
            recommendations: recommendations.slice(0, 2), // Limit for API response
            profile: {
              overallProgress: profile?.overallProgress || 0,
              learningVelocity: profile?.learningVelocity || 0,
              retentionRate: profile?.retentionRate || 0,
              optimalDifficulty: profile?.optimalDifficulty || 5,
              preferredSessionLength: profile?.preferredSessionLength || 30
            },
            analytics
          })

        } catch (error) {
          span.recordException(error as Error)
          console.error('Adaptive learning error:', error)
          
          return NextResponse.json(
            { error: 'Failed to record learning event' },
            { status: 500 }
          )
        }
      }
    )
  }, 'api')
}

// Get user recommendations and profile
export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
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

      const url = new URL(request.url)
      const includeProfile = url.searchParams.get('profile') === 'true'
      const includeAnalytics = url.searchParams.get('analytics') === 'true'
      const includeRecommendations = url.searchParams.get('recommendations') === 'true'

      const response: any = {
        success: true,
        userId: user.id
      }

      if (includeRecommendations) {
        response.recommendations = await adaptiveLearning.generateRecommendations(user.id)
      }

      if (includeProfile) {
        response.profile = adaptiveLearning.getUserProfile(user.id)
      }

      if (includeAnalytics) {
        response.analytics = adaptiveLearning.getLearningAnalytics(user.id)
      }

      // If no specific data requested, return recommendations by default
      if (!includeProfile && !includeAnalytics && !includeRecommendations) {
        response.recommendations = await adaptiveLearning.generateRecommendations(user.id)
      }

      return NextResponse.json(response)

    } catch (error) {
      console.error('Adaptive learning retrieval error:', error)
      
      return NextResponse.json(
        { error: 'Failed to retrieve adaptive learning data' },
        { status: 500 }
      )
    }
  }, 'api')
}