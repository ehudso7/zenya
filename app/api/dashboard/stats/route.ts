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

    // Fetch user profile with streak data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*, user_streaks(*)')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    // Fetch user progress stats
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('xp_earned, time_spent_seconds, completed_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')

    if (progressError) {
      console.error('Progress fetch error:', progressError)
    }

    // Fetch achievements count
    const { count: achievementsCount } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Calculate stats
    const totalXP = profile?.current_xp || 0
    const currentStreak = profile?.user_streaks?.[0]?.current_streak || profile?.streak_count || 0
    const lessonsCompleted = progressData?.length || 0
    const totalTimeSeconds = progressData?.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0) || 0
    const hoursLearned = Math.round(totalTimeSeconds / 3600)

    // Calculate level (simple formula for now)
    const level = Math.floor(totalXP / 100) + 1
    const nextLevelXP = level * 100

    // Get recent activity (last 5 completed lessons)
    const recentActivity = progressData
      ?.filter(p => p.completed_at)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(0, 5)
      .map(p => ({
        type: 'lesson',
        title: 'Completed lesson',
        xp: p.xp_earned || 0,
        timestamp: p.completed_at
      })) || []

    // Get upcoming lessons (placeholder for now)
    const upcomingLessons: any[] = []

    // Calculate weekly goal progress (placeholder - 7 hours goal)
    const weeklyGoalHours = 7
    const currentWeekHours = Math.min(hoursLearned, weeklyGoalHours)
    const weeklyGoalProgress = Math.round((currentWeekHours / weeklyGoalHours) * 100)

    return NextResponse.json({
      totalXP,
      currentStreak,
      lessonsCompleted,
      hoursLearned,
      achievements: achievementsCount || 0,
      level,
      nextLevelXP,
      weeklyGoalProgress,
      recentActivity,
      upcomingLessons
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}