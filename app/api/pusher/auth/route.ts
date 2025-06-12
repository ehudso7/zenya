import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { pusherServer } from '@/lib/websocket/pusher-adapter'

export async function POST(request: NextRequest) {
  try {
    if (!pusherServer) {
      return NextResponse.json(
        { error: 'WebSocket service not configured' },
        { status: 503 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { socket_id, channel_name } = body

    // Validate channel access
    if (channel_name.startsWith('private-session-') || 
        channel_name.startsWith('presence-session-')) {
      
      const sessionId = channel_name.split('-').pop()
      
      // Verify user has access to this session
      const { data: participant } = await supabase
        .from('collaborative_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .single()
      
      if (!participant) {
        return NextResponse.json(
          { error: 'Access denied to this session' },
          { status: 403 }
        )
      }
    }

    // Authenticate with Pusher
    const auth = await pusherServer.authenticateUser(
      socket_id,
      channel_name,
      user.id
    )

    return NextResponse.json(auth)
    
  } catch (error) {
    console.error('Pusher auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}