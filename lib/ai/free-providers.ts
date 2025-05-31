import type { Mood, AIResponse } from '@/types'

// Option 1: Hugging Face Inference API (Free tier available)
export async function generateHuggingFaceResponse(
  message: string,
  mood: Mood | null,
  context?: string
): Promise<AIResponse> {
  const token = process.env.HUGGINGFACE_API_KEY
  
  if (!token) {
    return getFallbackResponse(message, mood)
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        headers: { Authorization: `Bearer ${token}` },
        method: "POST",
        body: JSON.stringify({ inputs: message }),
      }
    )
    
    const result = await response.json()
    return {
      message: result.generated_text || getFallbackResponse(message, mood).message,
      tone: mood ? getToneFromMood(mood) : 'supportive',
    }
  } catch (error) {
    return getFallbackResponse(message, mood)
  }
}

// Option 2: Cohere API (Free tier: 1000 calls/month)
export async function generateCohereResponse(
  message: string,
  mood: Mood | null,
  context?: string
): Promise<AIResponse> {
  const apiKey = process.env.COHERE_API_KEY
  
  if (!apiKey) {
    return getFallbackResponse(message, mood)
  }

  try {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-light', // Free tier model
        prompt: `You are a supportive learning coach. User says: "${message}". Respond helpfully in 1-2 sentences.`,
        max_tokens: 100,
        temperature: 0.7,
      }),
    })
    
    const data = await response.json()
    return {
      message: data.generations?.[0]?.text || getFallbackResponse(message, mood).message,
      tone: mood ? getToneFromMood(mood) : 'supportive',
    }
  } catch (error) {
    return getFallbackResponse(message, mood)
  }
}

// Option 3: Use pre-written responses (completely free)
export function getFallbackResponse(message: string, mood: Mood | null): AIResponse {
  const lowercaseMessage = message.toLowerCase()
  
  // Question about understanding
  if (lowercaseMessage.includes('what') || lowercaseMessage.includes('how')) {
    return {
      message: "Great question! Let me break that down for you. The key thing to remember is to take it one step at a time. What specific part would you like me to focus on?",
      tone: 'encouraging',
    }
  }
  
  // Confusion
  if (lowercaseMessage.includes('confused') || lowercaseMessage.includes("don't understand")) {
    return {
      message: "No worries at all! This can be tricky. Think of it like learning to ride a bike - wobbly at first, but it gets easier. Should we try a different approach?",
      tone: 'calm',
    }
  }
  
  // Progress/completion
  if (lowercaseMessage.includes('done') || lowercaseMessage.includes('finished')) {
    return {
      message: "Fantastic work! 🎉 You're making great progress. Every step forward counts, no matter how small. Ready for the next challenge?",
      tone: 'energetic',
    }
  }
  
  // Default encouraging response
  return {
    message: "I hear you! Let's work through this together. Remember, there's no rush - your pace is the perfect pace. What would help you most right now?",
    tone: 'supportive',
  }
}

function getToneFromMood(mood: Mood): AIResponse['tone'] {
  const toneMap = {
    '😴': 'calm',
    '😐': 'supportive',
    '🙂': 'encouraging',
    '😄': 'energetic',
    '🔥': 'energetic',
  } as const
  
  return toneMap[mood] || 'supportive'
}