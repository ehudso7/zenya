import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'
import { withRateLimit } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all user data
    const userId = session.user.id
    const userData: Record<string, unknown> = {
      exportDate: new Date().toISOString(),
      user: {
        id: userId,
        email: session.user.email,
        createdAt: session.user.created_at,
      }
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (profile) {
      userData.profile = profile
    }

    // Fetch user progress
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*, lessons(title, description)')
      .eq('user_id', userId)
    
    if (progress) {
      userData.progress = progress
    }

    // Fetch user achievements
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
    
    if (achievements) {
      userData.achievements = achievements
    }

    // Fetch user sessions
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100) // Last 100 sessions
    
    if (sessions) {
      userData.recentSessions = sessions
    }

    // Create downloadable JSON file
    const jsonData = JSON.stringify(userData, null, 2)
    const filename = `zenya-data-export-${userId}-${Date.now()}.json`

    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
    } catch (_error) {
      console.error('Error exporting user data:', _error)
      return NextResponse.json(
        { error: 'Failed to export user data' },
        { status: 500 }
      )
    }
  }, 'api')
}