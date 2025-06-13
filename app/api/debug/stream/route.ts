import { NextRequest, NextResponse } from 'next/server'

// Store active SSE connections
const connections = new Map<string, ReadableStreamDefaultController>()

export async function GET(req: NextRequest) {
  const sessionId = crypto.randomUUID()
  
  const stream = new ReadableStream({
    start(controller) {
      connections.set(sessionId, controller)
      
      // Send initial connection message
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
        type: 'connected', 
        sessionId,
        timestamp: new Date().toISOString() 
      })}\n\n`))
      
      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`:heartbeat ${Date.now()}\n\n`))
        } catch (error) {
          clearInterval(heartbeat)
          connections.delete(sessionId)
        }
      }, 30000)
      
      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        connections.delete(sessionId)
        controller.close()
      })
    }
  })
  
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Debug-Session': sessionId
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data, sessionId } = body
    
    // Broadcast to all connected debug sessions
    const encoder = new TextEncoder()
    const message = encoder.encode(`data: ${JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString(),
      sessionId
    })}\n\n`)
    
    connections.forEach((controller, id) => {
      try {
        controller.enqueue(message)
      } catch (error) {
        // Remove dead connections
        connections.delete(id)
      }
    })
    
    return NextResponse.json({ success: true, connections: connections.size })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to broadcast debug message' }, { status: 500 })
  }
}