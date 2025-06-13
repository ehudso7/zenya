import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    // Check if essential AI services are configured
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
    const hasFineTuned = process.env.ENABLE_FINE_TUNED_MODEL === 'true'
    
    const status = hasOpenAI || hasAnthropic ? 'ready' : 'not_configured'
    
    return NextResponse.json({
      status,
      providers: {
        openai: hasOpenAI,
        anthropic: hasAnthropic,
        fineTuned: hasFineTuned
      },
      timestamp: new Date().toISOString()
    })
  } catch (_error) {
    return NextResponse.json(
      { status: 'error', error: 'Failed to check AI health' },
      { status: 500 }
    )
  }
}