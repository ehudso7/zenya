import type { Mood, AIResponse } from '@/types'

// This file contains only types and helper functions for free AI providers
// Actual API calls are made server-side in /app/api/ai/route.ts

export function getToneFromMood(mood: Mood): AIResponse['tone'] {
  const toneMap = {
    '😴': 'calm',
    '😐': 'supportive',
    '🙂': 'encouraging',
    '😄': 'energetic',
    '🔥': 'energetic',
  } as const
  
  return toneMap[mood] || 'supportive'
}

// Pre-written responses for fallback (completely free)
export function getFallbackResponse(message: string, mood: Mood | null): AIResponse {
  const lowercaseMessage = message.toLowerCase()
  
  // Question about understanding
  if (lowercaseMessage.includes('what') || lowercaseMessage.includes('how')) {
    return {
      message: "Great question! Let me break that down for you. The key thing to remember is to take it one step at a time. What specific part would you like me to focus on?",
      tone: mood ? getToneFromMood(mood) : 'encouraging',
    }
  }
  
  // Need for clarity
  if (lowercaseMessage.includes('confused') || lowercaseMessage.includes("don't understand")) {
    return {
      message: "No worries at all! Let's explore this from a different angle. Think of it like learning to ride a bike - each attempt builds your skills. Should we try a different approach?",
      tone: mood ? getToneFromMood(mood) : 'calm',
    }
  }
  
  // Progress/completion
  if (lowercaseMessage.includes('done') || lowercaseMessage.includes('finished')) {
    return {
      message: "Fantastic work! 🎉 You're making great progress. Every step forward counts, no matter how small. Ready for the next challenge?",
      tone: mood ? getToneFromMood(mood) : 'energetic',
    }
  }
  
  // Greeting
  if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
    return {
      message: "Hello! Great to see you here. I'm excited to help you learn today. What would you like to explore?",
      tone: mood ? getToneFromMood(mood) : 'supportive',
    }
  }
  
  // Help request
  if (lowercaseMessage.includes('help')) {
    return {
      message: "I'm here to guide you step by step. Remember, there's no such thing as a silly question. What specific topic would you like help with?",
      tone: mood ? getToneFromMood(mood) : 'supportive',
    }
  }
  
  // Feeling stuck
  if (lowercaseMessage.includes('stuck')) {
    return {
      message: "Let's work through this together. Sometimes taking a small break can help clear your mind. Can you tell me what part is challenging you?",
      tone: mood ? getToneFromMood(mood) : 'calm',
    }
  }
  
  // Default encouraging response
  return {
    message: "I hear you! Let's work through this together. Remember, there's no rush - your pace is the perfect pace. What would help you most right now?",
    tone: mood ? getToneFromMood(mood) : 'supportive',
  }
}