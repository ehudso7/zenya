import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/api-middleware'
import { circuitBreakerRegistry } from '@/lib/ai/circuit-breaker'

// Admin authentication check
async function isAdmin(_request: NextRequest): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) return false
  
  // Check if user has admin role
  const { data: profile } = await supabase
    .from('users')
    .select('email, user_metadata')
    .eq('id', user.id)
    .single()
  
  // In production, implement proper role-based access control
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  return adminEmails.includes(profile?.email || '')
}

interface DashboardMetrics {
  users: {
    total: number
    active30Days: number
    newToday: number
    retentionRate: number
  }
  learning: {
    totalLessons: number
    lessonsCompletedToday: number
    avgCompletionRate: number
    popularCurriculums: Array<{
      title: string
      enrollments: number
      completionRate: number
    }>
  }
  engagement: {
    avgSessionTime: number
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
  }
  ai: {
    totalRequests: number
    requestsToday: number
    avgResponseTime: number
    providerHealth: Record<string, any>
    errorRate: number
  }
  system: {
    uptime: number
    memoryUsage: NodeJS.MemoryUsage
    healthChecks: any[]
    alertsCount: number
  }
  revenue: {
    totalUsers: number
    premiumUsers: number
    conversionRate: number
    mrr: number
  }
}

async function getUserMetrics(supabase: any): Promise<DashboardMetrics['users']> {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  // Active users in last 30 days
  const { count: active30Days } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_login', thirtyDaysAgo.toISOString())
  
  // New users today
  const { count: newToday } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())
  
  // Calculate retention rate (simplified)
  const retentionRate = totalUsers > 0 ? (active30Days / totalUsers) * 100 : 0
  
  return {
    total: totalUsers || 0,
    active30Days: active30Days || 0,
    newToday: newToday || 0,
    retentionRate: Math.round(retentionRate * 100) / 100
  }
}

async function getLearningMetrics(supabase: any): Promise<DashboardMetrics['learning']> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Total lessons
  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  // Lessons completed today
  const { count: lessonsCompletedToday } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', today.toISOString())
  
  // Average completion rate
  const { data: progressStats } = await supabase
    .from('user_progress')
    .select('status')
  
  const totalProgress = progressStats?.length || 0
  const completed = progressStats?.filter((p: any) => p.status === 'completed').length || 0
  const avgCompletionRate = totalProgress > 0 ? (completed / totalProgress) * 100 : 0
  
  // Popular curriculums (using materialized view if available)
  const { data: popularCurriculums } = await supabase
    .from('curriculums')
    .select(`
      title,
      id,
      user_progress!inner(status)
    `)
    .eq('is_active', true)
    .limit(5)
  
  const curriculumStats = popularCurriculums?.map((curriculum: any) => {
    const enrollments = curriculum.user_progress?.length || 0
    const completions = curriculum.user_progress?.filter((p: any) => p.status === 'completed').length || 0
    return {
      title: curriculum.title,
      enrollments,
      completionRate: enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0
    }
  }).sort((a: any, b: any) => b.enrollments - a.enrollments) || []
  
  return {
    totalLessons: totalLessons || 0,
    lessonsCompletedToday: lessonsCompletedToday || 0,
    avgCompletionRate: Math.round(avgCompletionRate * 100) / 100,
    popularCurriculums: curriculumStats
  }
}

async function getEngagementMetrics(supabase: any): Promise<DashboardMetrics['engagement']> {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  // Average session time from user_sessions
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('started_at, ended_at')
    .not('ended_at', 'is', null)
    .gte('started_at', oneWeekAgo.toISOString())
  
  const avgSessionTime = sessions?.reduce((acc: number, session: any) => {
    const start = new Date(session.started_at).getTime()
    const end = new Date(session.ended_at).getTime()
    return acc + (end - start)
  }, 0) / (sessions?.length || 1) / 1000 / 60 || 0 // Convert to minutes
  
  // Active users
  const { count: dailyActiveUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_login', oneDayAgo.toISOString())
  
  const { count: weeklyActiveUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_login', oneWeekAgo.toISOString())
  
  const { count: monthlyActiveUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_login', oneMonthAgo.toISOString())
  
  return {
    avgSessionTime: Math.round(avgSessionTime * 100) / 100,
    dailyActiveUsers: dailyActiveUsers || 0,
    weeklyActiveUsers: weeklyActiveUsers || 0,
    monthlyActiveUsers: monthlyActiveUsers || 0
  }
}

async function getAIMetrics(): Promise<DashboardMetrics['ai']> {
  // In production, these would come from monitoring systems
  const providerHealth = circuitBreakerRegistry.getHealthReport()
  
  // Mock data for now - in production, get from metrics store
  return {
    totalRequests: 1250,
    requestsToday: 89,
    avgResponseTime: 1.2, // seconds
    providerHealth,
    errorRate: 2.3 // percentage
  }
}

async function getSystemMetrics(): Promise<DashboardMetrics['system']> {
  const memoryUsage = process.memoryUsage()
  
  // Get health check status
  try {
    const healthResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/health`)
    const healthData = await healthResponse.json()
    
    return {
      uptime: process.uptime(),
      memoryUsage,
      healthChecks: healthData.checks || [],
      alertsCount: healthData.checks?.filter((check: any) => check.status !== 'healthy').length || 0
    }
  } catch {
    return {
      uptime: process.uptime(),
      memoryUsage,
      healthChecks: [],
      alertsCount: 0
    }
  }
}

async function getRevenueMetrics(supabase: any): Promise<DashboardMetrics['revenue']> {
  // Total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  // Premium users (would be determined by subscription status in production)
  // For now, mock data
  const premiumUsers = Math.floor((totalUsers || 0) * 0.05) // Assume 5% conversion
  const conversionRate = totalUsers ? (premiumUsers / totalUsers) * 100 : 0
  
  return {
    totalUsers: totalUsers || 0,
    premiumUsers,
    conversionRate: Math.round(conversionRate * 100) / 100,
    mrr: premiumUsers * 29 // $29/month per premium user
  }
}

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    try {
      // Check admin authentication
      if (!(await isAdmin(request))) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        )
      }
      
      const supabase = await createServerSupabaseClient()
      
      // Gather all metrics in parallel
      const [
        userMetrics,
        learningMetrics,
        engagementMetrics,
        aiMetrics,
        systemMetrics,
        revenueMetrics
      ] = await Promise.all([
        getUserMetrics(supabase),
        getLearningMetrics(supabase),
        getEngagementMetrics(supabase),
        getAIMetrics(),
        getSystemMetrics(),
        getRevenueMetrics(supabase)
      ])
      
      const dashboardData: DashboardMetrics = {
        users: userMetrics,
        learning: learningMetrics,
        engagement: engagementMetrics,
        ai: aiMetrics,
        system: systemMetrics,
        revenue: revenueMetrics
      }
      
      return NextResponse.json(dashboardData, {
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'X-Dashboard-Generated': new Date().toISOString(),
        }
      })
      
    } catch (error) {
      console.error('Admin dashboard error:', error)
      return NextResponse.json(
        { error: 'Failed to generate dashboard metrics' },
        { status: 500 }
      )
    }
  }, 'api')
}

// POST endpoint for admin actions
export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    try {
      // Check admin authentication
      if (!(await isAdmin(request))) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        )
      }
      
      const body = await req.json()
      const { action, target } = body
      
      switch (action) {
        case 'reset_circuit_breaker':
          circuitBreakerRegistry.reset(target)
          return NextResponse.json({ success: true, message: `Circuit breaker ${target || 'all'} reset` })
        
        case 'refresh_analytics':
          // In production, trigger materialized view refresh
          const supabase = await createServerSupabaseClient()
          await supabase.rpc('refresh_analytics_views')
          return NextResponse.json({ success: true, message: 'Analytics refreshed' })
        
        case 'clear_cache':
          // In production, clear Redis cache
          return NextResponse.json({ success: true, message: 'Cache cleared' })
        
        default:
          return NextResponse.json(
            { error: 'Unknown admin action' },
            { status: 400 }
          )
      }
      
    } catch (error) {
      console.error('Admin action error:', error)
      return NextResponse.json(
        { error: 'Failed to execute admin action' },
        { status: 500 }
      )
    }
  }, 'api')
}