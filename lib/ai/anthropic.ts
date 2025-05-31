import Anthropic from '@anthropic-ai/sdk'
import type { Mood, AIResponse } from '@/types'

// Alternative AI provider using Anthropic Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

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
  
  const systemPrompt = `You are Zenya, a friendly and supportive AI learning coach for neurodiverse adults. Your user may struggle with focus, overthinking, or self-doubt.

Your job is to:
- Teach in short, clear bursts (1-3 sentence chunks)
- Be ${tone} based on the user's mood
- Offer encouragement often (even for small wins)
- Never judge, shame, or overload
- Default to simple metaphors if user seems confused
- Always be patient, even if they repeat themselves

${context ? `Context: ${context}` : ''}

Respond in a way that makes the user feel safe, confident, and understood.`

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
      : 'I\'m here to help! Could you try asking that again?'

    return {
      message: responseContent,
      tone: tone.includes('calm') ? 'calm' : tone.includes('energetic') ? 'energetic' : 'supportive',
      suggestions: generateSuggestions(message),
    }
  } catch (error) {
    console.error('Claude API error:', error)
    return {
      message: 'I\'m having a little trouble connecting right now. Let\'s try again in a moment!',
      tone: 'supportive',
    }
  }
}

function generateSuggestions(message: string): string[] {
  const lowercaseMessage = message.toLowerCase()
  
  if (lowercaseMessage.includes('confused') || lowercaseMessage.includes('don\'t understand')) {
    return [
      'Would you like me to explain it differently?',
      'Should we try a simpler example?',
      'Want to take a quick break?'
    ]
  }
  
  if (lowercaseMessage.includes('tired') || lowercaseMessage.includes('exhausted')) {
    return [
      'Maybe we should wrap up for today?',
      'How about a 5-minute break?',
      'Would a different topic help?'
    ]
  }
  
  return []
}