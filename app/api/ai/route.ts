import { NextRequest, NextResponse } from 'next/server'
import { generateAIResponse } from '@/lib/ai/openai'
import type { Mood } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { message, mood, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const response = await generateAIResponse(
      message,
      mood as Mood | null,
      context
    )

    return NextResponse.json(response)
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}