import type { Mood, AIResponse } from '@/types'

// Optional Anthropic import - only if API key is provided
let anthropic: any = null

try {
  if (process.env.ANTHROPIC_API_KEY) {
    const Anthropic = require('@anthropic-ai/sdk')
    anthropic = new Anthropic.default({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
} catch (error) {
  console.log('Anthropic SDK not available, using fallback')
}

const moodToTone = {
  '😴': 'calm and gentle',
  '😐': 'supportive and understanding',
  '🙂': 'encouraging and positive',
  '😄': 'energetic and enthusiastic',
  '🔥': 'highly energetic and motivating',
} as const

export async function generateClaudeResponse(
  message: string,
  mood: Mood | null,
  context?: string
): Promise<AIResponse> {
  const tone = mood ? moodToTone[mood] : 'encouraging and positive'
  
  const systemPrompt = `You are Zenya, a friendly and supportive AI learning coach for neurodiverse adults. Your user may be working through focus differences, processing their thoughts, or building confidence.

Your job is to:
- Teach in short, clear bursts (1-3 sentence chunks)
- Be ${tone} based on the user's mood
- Offer encouragement often (even for small wins)
- Never judge, shame, or overload
- Default to simple metaphors if user needs clarity
- Always be patient, even if they repeat themselves

${context ? `Context: ${context}` : ''}

Respond in a way that makes the user feel safe, confident, and understood.`

  // If Anthropic is not available, return a fallback response
  if (!anthropic) {
    return {
      message: 'I am here to help! Let me process that for you. ' + 
               (message.toLowerCase().includes('hello') 
                 ? 'Hello! Great to see you here. What would you like to learn today?'
                 : 'That is a great question! Let me help you understand it step by step.'),
      tone: tone.includes('calm') ? 'calm' : tone.includes('energetic') ? 'energetic' : 'supportive',
      suggestions: generateSuggestions(message),
    }
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Cheaper model, still great quality
      messages: [{ role: 'user', content: message }],
      system: systemPrompt,
      max_tokens: 200,
      temperature: 0.7,
    })

    const responseContent = response.content[0]?.type === 'text' 
      ? response.content[0].text 
      : 'I am here to help! Could you try asking that again?'

    return {
      message: responseContent,
      tone: tone.includes('calm') ? 'calm' : tone.includes('energetic') ? 'energetic' : 'supportive',
      suggestions: generateSuggestions(message),
    }
  } catch (error) {
    console.error('Claude API error:', error)
    return {
      message: 'I am having a little trouble connecting right now. Let us try again in a moment!',
      tone: 'supportive',
    }
  }
}

function generateSuggestions(message: string): string[] {
  const lowercaseMessage = message.toLowerCase()
  
  if (lowercaseMessage.includes('confused') || lowercaseMessage.includes('do not understand')) {
    return [
      'Would you like me to explain it differently?',
      'Should we explore a different example?',
      'Want to take a quick break?'
    ]
  }
  
  if (lowercaseMessage.includes('tired') || lowercaseMessage.includes('exhausted')) {
    return [
      'Would you like to pause here for today?',
      'How about a refreshing 5-minute break?',
      'Would exploring a different topic help?'
    ]
  }
  
  return []
}