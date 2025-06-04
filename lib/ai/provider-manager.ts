import type { Mood, AIResponse } from '@/types'

// This file contains only types and interfaces for AI provider management
// Actual API calls are made server-side in /app/api/ai/route.ts

export interface ProviderConfig {
  name: string
  cost: 'premium' | 'low' | 'free'
  priority: number
}

export interface AIResponseWithProvider extends AIResponse {
  provider: string
}

// Helper function to generate suggestions based on message content
export function generateSuggestions(message: string): string[] {
  const lowercaseMessage = message.toLowerCase()
  
  if (lowercaseMessage.includes('confused') || lowercaseMessage.includes("don't understand")) {
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

// Fallback response generator
export function getFallbackResponse(message: string, mood: Mood | null): AIResponse {
  const lowercaseMessage = message.toLowerCase()
  
  let response = "I'm here to help! Let me process that for you. "
  
  if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
    response += "Hello! Great to see you here. What would you like to learn today?"
  } else if (lowercaseMessage.includes('help')) {
    response += "I'm here to guide you step by step. What specific topic would you like help with?"
  } else if (lowercaseMessage.includes('stuck')) {
    response += "Let's work through this together. Can you tell me what part is challenging you?"
  } else {
    response += "That's a great question! Let me help you understand it step by step."
  }
  
  return {
    message: response,
    tone: mood === '😴' ? 'calm' : mood === '🔥' || mood === '😄' ? 'energetic' : 'supportive',
    suggestions: generateSuggestions(message),
  }
}