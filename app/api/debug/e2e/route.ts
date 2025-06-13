import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// E2E Test monitoring endpoint
export async function POST(request: NextRequest) {
  // Only allow in development
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
  
  if (!isLocalhost && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'E2E endpoint only available in development' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { action, testName, data } = body

    // Broadcast test event to debug monitor
    await fetch(`http://${host}/api/debug/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'e2e-test',
        data: {
          action,
          testName,
          data,
          timestamp: new Date().toISOString()
        }
      })
    })

    // Log to console for CI/CD
    // eslint-disable-next-line no-console
    console.log(`[E2E Test] ${action}: ${testName}`, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[E2E Test] Error:', error)
    return NextResponse.json(
      { error: 'Failed to log E2E test event' },
      { status: 500 }
    )
  }
}

// Start an E2E test session
export async function GET(_request: NextRequest) {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
  
  if (!isLocalhost && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'E2E endpoint only available in development' },
      { status: 403 }
    )
  }

  const testSessionId = `e2e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Broadcast test session start
  await fetch(`http://${host}/api/debug/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'e2e-session',
      data: {
        action: 'start',
        sessionId: testSessionId,
        timestamp: new Date().toISOString()
      }
    })
  })

  return NextResponse.json({
    sessionId: testSessionId,
    debugUrl: `http://${host}/debug/monitor`,
    instructions: {
      start: 'Open the debug monitor URL in a separate window',
      test: 'Run your E2E tests - all events will be captured',
      monitor: 'Watch real-time logs, API calls, errors, and user interactions',
      filter: 'Use filters in debug monitor to focus on specific event types'
    }
  })
}