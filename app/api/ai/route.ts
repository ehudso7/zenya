import { NextRequest, NextResponse } from 'next/server'
import { generateAIResponse } from '@/lib/ai/openai'
import { generateClaudeResponse } from '@/lib/ai/anthropic'
import { getFallbackResponse, generateHuggingFaceResponse, generateCohereResponse } from '@/lib/ai/free-providers'
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

    // Try different AI providers in order of preference
    let response;
    
    // 1. Try OpenAI first (if API key exists and has balance)
    if (process.env.OPENAI_API_KEY) {
      try {
        response = await generateAIResponse(message, mood as Mood | null, context)
        if (response.message !== 'I\'m having a little trouble connecting right now. Let\'s try again in a moment!') {
          return NextResponse.json(response)
        }
      } catch (error) {
        console.log('OpenAI failed, trying alternatives...')
      }
    }
    
    // 2. Try Anthropic Claude (if configured)
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        response = await generateClaudeResponse(message, mood as Mood | null, context)
        return NextResponse.json(response)
      } catch (error) {
        console.log('Claude failed, trying free alternatives...')
      }
    }
    
    // 3. Try free alternatives
    if (process.env.HUGGINGFACE_API_KEY) {
      response = await generateHuggingFaceResponse(message, mood as Mood | null, context)
    } else if (process.env.COHERE_API_KEY) {
      response = await generateCohereResponse(message, mood as Mood | null, context)
    } else {
      // 4. Fall back to pre-written responses (always works, no API needed)
      response = getFallbackResponse(message, mood as Mood | null)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}