import OpenAI from 'openai'
import type { Mood, AIResponse } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const moodToTone = {
  '😴': 'calm',
  '😐': 'supportive',
  '🙂': 'encouraging',
  '😄': 'energetic',
  '🔥': 'energetic',
} as const

export async function generateAIResponse(
  message: string,
  mood: Mood | null,
  context?: string
): Promise<AIResponse> {
  const tone = mood ? moodToTone[mood] : 'encouraging'
  
  const systemPrompt = `You are Zenya, a friendly and supportive AI learning coach for neurodiverse adults. Your user may be working through focus differences, processing their thoughts, or building confidence.

Your job is to:
- Teach in short, clear bursts (1-3 sentence chunks)
- Adapt your tone to be ${tone} based on the user's mood
- Offer encouragement often (even for small wins)
- Never judge, shame, or overload
- Default to simple metaphors if user needs clarity
- Always be patient, even if they repeat themselves

${context ? `Context: ${context}` : ''}

Respond in a way that makes the user feel safe, confident, and understood.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const responseContent = completion.choices[0]?.message?.content || 'I\'m here to help! Could you try asking that again?'

    return {
      message: responseContent,
      tone: tone as AIResponse['tone'],
      suggestions: generateSuggestions(message),
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
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