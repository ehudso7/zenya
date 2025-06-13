import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Store active debug sessions
const debugSessions = new Map<string, {
  sessionId: string
  createdAt: Date
  lastActivity: Date
  stream: ReadableStreamDefaultController
}>()

// Clean up old sessions
setInterval(() => {
  const now = new Date()
  debugSessions.forEach((session, id) => {
    const idleTime = now.getTime() - session.lastActivity.getTime()
    if (idleTime > 30 * 60 * 1000) { // 30 minutes
      try {
        session.stream.close()
      } catch {
        // Already closed
      }
      debugSessions.delete(id)
    }
  })
}, 5 * 60 * 1000) // Every 5 minutes

export async function GET(request: NextRequest) {
  // Only allow in development
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
  
  if (!isLocalhost && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    )
  }

  // Create a unique session ID
  const sessionId = `debug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Store the session
      debugSessions.set(sessionId, {
        sessionId,
        createdAt: new Date(),
        lastActivity: new Date(),
        stream: controller
      })

      // Send initial connection message
      controller.enqueue(
        `data: ${JSON.stringify({
          type: 'connected',
          sessionId,
          timestamp: new Date().toISOString()
        })}\n\n`
      )

      // Send heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            })}\n\n`
          )
        } catch {
          clearInterval(heartbeatInterval)
        }
      }, 30000)

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval)
        debugSessions.delete(sessionId)
        try {
          controller.close()
        } catch {
          // Already closed
        }
      })
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Debug-Session': sessionId
    }
  })
}

export async function POST(request: NextRequest) {
  // Only allow in development
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
  
  if (!isLocalhost && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { type, data, broadcast = true } = body

    // Broadcast to all active debug sessions
    if (broadcast) {
      debugSessions.forEach(session => {
        try {
          session.lastActivity = new Date()
          session.stream.enqueue(
            `data: ${JSON.stringify({
              type,
              data,
              timestamp: new Date().toISOString(),
              sessionId: session.sessionId
            })}\n\n`
          )
        } catch {
          // Session might be closed
          debugSessions.delete(session.sessionId)
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      activeSessions: debugSessions.size 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to broadcast debug message' },
      { status: 500 }
    )
  }
}