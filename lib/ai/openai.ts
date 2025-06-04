// This file contains only types and helper functions for OpenAI integration
// Actual API calls are made server-side in /app/api/ai/route.ts

export const moodToTone = {
  '😴': 'calm',
  '😐': 'supportive',
  '🙂': 'encouraging',
  '😄': 'energetic',
  '🔥': 'energetic',
} as const

export function getSystemPrompt(tone: string, context?: string): string {
  return `You are Zenya, a friendly and supportive AI learning coach for neurodiverse adults. Your user may be working through focus differences, processing their thoughts, or building confidence.

Your job is to:
- Teach in short, clear bursts (1-3 sentence chunks)
- Adapt your tone to be ${tone} based on the user's mood
- Offer encouragement often (even for small wins)
- Never judge, shame, or overload
- Default to simple metaphors if user needs clarity
- Always be patient, even if they repeat themselves

${context ? `Context: ${context}` : ''}

Respond in a way that makes the user feel safe, confident, and understood.`
}

export function generateSuggestions(message: string): string[] {
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