import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Mood, AIResponse } from '@/types'
import { getFallbackResponse, getToneFromMood } from '@/lib/ai/free-providers'
import { generateSuggestions } from '@/lib/ai/provider-manager'
import { withRateLimit } from '@/lib/api-middleware'
import { 
  moodToTone as openAIMoodToTone, 
  getSystemPrompt as getOpenAISystemPrompt 
} from '@/lib/ai/openai'
import { 
  moodToTone as anthropicMoodToTone, 
  getSystemPrompt as getAnthropicSystemPrompt,
  normalizeTone 
} from '@/lib/ai/anthropic'
import { aiRequestSchema } from '@/lib/validations'
import { validateRequest } from '@/lib/validation-middleware'

// Provider configuration
interface ProviderConfig {
  name: string
  isAvailable: () => boolean
  generate: (message: string, mood: Mood | null, context?: string) => Promise<AIResponse>
  cost: 'premium' | 'low' | 'free'
  priority: number
}

// Track usage for load balancing
const providerUsage = new Map<string, { count: number; lastReset: Date }>()

// Reset counts daily
function resetDailyLimits() {
  const now = new Date()
  providerUsage.forEach((usage) => {
    const hoursSinceReset = (now.getTime() - usage.lastReset.getTime()) / (1000 * 60 * 60)
    if (hoursSinceReset >= 24) {
      usage.count = 0
      usage.lastReset = now
    }
  })
}

// Get provider usage
function getProviderUsage(providerName: string): number {
  resetDailyLimits()
  return providerUsage.get(providerName)?.count || 0
}

// Increment provider usage
function incrementProviderUsage(providerName: string) {
  resetDailyLimits()
  const usage = providerUsage.get(providerName) || { count: 0, lastReset: new Date() }
  usage.count++
  providerUsage.set(providerName, usage)
}

// OpenAI provider implementation
async function generateOpenAIResponse(
  message: string,
  mood: Mood | null,
  context?: string
): Promise<AIResponse> {
  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const tone = mood ? openAIMoodToTone[mood] : 'encouraging'
  const systemPrompt = getOpenAISystemPrompt(tone, context)

  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: openaiKey })
    
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
    throw error
  }
}

// Anthropic provider implementation
async function generateAnthropicResponse(
  message: string,
  mood: Mood | null,
  context?: string
): Promise<AIResponse> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    throw new Error('Anthropic API key not configured')
  }

  const tone = mood ? anthropicMoodToTone[mood] : 'encouraging and positive'
  const systemPrompt = getAnthropicSystemPrompt(tone, context)

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const anthropic = new Anthropic({ apiKey: anthropicKey })
    
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
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
      tone: normalizeTone(tone),
      suggestions: generateSuggestions(message),
    }
  } catch (error) {
    console.error('Anthropic API error:', error)
    throw error
  }
}

// Hugging Face provider implementation
async function generateHuggingFaceResponse(
  message: string,
  mood: Mood | null,
  _context?: string
): Promise<AIResponse> {
  const token = process.env.HUGGINGFACE_API_KEY
  if (!token) {
    throw new Error('Hugging Face API key not configured')
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
      suggestions: generateSuggestions(message),
    }
  } catch (error) {
    console.error('Hugging Face API error:', error)
    throw error
  }
}

// Cohere provider implementation
async function generateCohereResponse(
  message: string,
  mood: Mood | null,
  _context?: string
): Promise<AIResponse> {
  const apiKey = process.env.COHERE_API_KEY
  if (!apiKey) {
    throw new Error('Cohere API key not configured')
  }

  try {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-light',
        prompt: `You are a supportive learning coach. User says: "${message}". Respond helpfully in 1-2 sentences.`,
        max_tokens: 100,
        temperature: 0.7,
      }),
    })
    
    const data = await response.json()
    return {
      message: data.generations?.[0]?.text || getFallbackResponse(message, mood).message,
      tone: mood ? getToneFromMood(mood) : 'supportive',
      suggestions: generateSuggestions(message),
    }
  } catch (error) {
    console.error('Cohere API error:', error)
    throw error
  }
}

// Define all available providers
const providers: ProviderConfig[] = [
  {
    name: 'openai',
    isAvailable: () => !!process.env.OPENAI_API_KEY,
    generate: generateOpenAIResponse,
    cost: 'premium',
    priority: 1,
  },
  {
    name: 'anthropic',
    isAvailable: () => !!process.env.ANTHROPIC_API_KEY,
    generate: generateAnthropicResponse,
    cost: 'low',
    priority: 2,
  },
  {
    name: 'cohere',
    isAvailable: () => !!process.env.COHERE_API_KEY && getProviderUsage('cohere') < 900,
    generate: generateCohereResponse,
    cost: 'free',
    priority: 3,
  },
  {
    name: 'huggingface',
    isAvailable: () => !!process.env.HUGGINGFACE_API_KEY,
    generate: generateHuggingFaceResponse,
    cost: 'free',
    priority: 4,
  },
]

// Smart provider selection with load balancing
async function generateSmartResponse(
  message: string,
  mood: Mood | null,
  context?: string
): Promise<AIResponse & { provider: string }> {
  resetDailyLimits()
  
  // Get available providers
  const availableProviders = providers.filter(p => p.isAvailable())
  
  // If we have both premium and free providers, implement smart rotation
  const premiumProviders = availableProviders.filter(p => p.cost === 'premium')
  const lowCostProviders = availableProviders.filter(p => p.cost === 'low')
  const freeProviders = availableProviders.filter(p => p.cost === 'free')
  
  // Determine which provider to use based on strategy
  let selectedProvider: ProviderConfig | null = null
  
  // Strategy: Use free providers 70% of the time if available to save costs
  const useFreeTier = Math.random() < 0.7
  
  if (useFreeTier && freeProviders.length > 0) {
    // Rotate between free providers
    selectedProvider = freeProviders[Math.floor(Math.random() * freeProviders.length)]
  } else if (lowCostProviders.length > 0 && Math.random() < 0.8) {
    // Use low-cost providers 80% of remaining time
    selectedProvider = lowCostProviders[0]
  } else if (premiumProviders.length > 0) {
    // Use premium providers for complex queries or 20% of time
    selectedProvider = premiumProviders[0]
  } else if (availableProviders.length > 0) {
    // Fallback to any available provider
    selectedProvider = availableProviders[0]
  }
  
  // Try selected provider
  if (selectedProvider) {
    try {
      incrementProviderUsage(selectedProvider.name)
      const response = await selectedProvider.generate(message, mood, context)
      
      // If provider returns error message, try free alternatives
      if (response.message.includes('trouble connecting') && selectedProvider.cost === 'premium') {
        const freeAlternative = freeProviders[Math.floor(Math.random() * freeProviders.length)]
        if (freeAlternative) {
          incrementProviderUsage(freeAlternative.name)
          const freeResponse = await freeAlternative.generate(message, mood, context)
          return { ...freeResponse, provider: freeAlternative.name }
        }
      }
      
      return { ...response, provider: selectedProvider.name }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`${selectedProvider.name} failed:`, error)
      }
      // Continue to fallback
    }
  }
  
  // Ultimate fallback
  return { ...getFallbackResponse(message, mood), provider: 'fallback' }
}

// Get provider statistics
function getProviderStats() {
  resetDailyLimits()
  const stats: Record<string, any> = {}
  
  providers.forEach(p => {
    stats[p.name] = {
      available: p.isAvailable(),
      cost: p.cost,
      usage: getProviderUsage(p.name),
      ...(p.name === 'cohere' && { remaining: 1000 - getProviderUsage('cohere') })
    }
  })
  
  return stats
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    try {
      // Check authentication
      const supabase = await createServerSupabaseClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      // Validate request body
      const { data, error: validationError } = await validateRequest(req, aiRequestSchema)
      
      if (validationError) {
        return validationError
      }

      const { message, mood, context } = data!

      // Use smart provider selection with load balancing
      const response = await generateSmartResponse(
        message,
        mood as Mood | null,
        context
      )

      // Log provider usage for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.log('Provider stats:', getProviderStats())
      }

      return NextResponse.json(response)
    } catch (error) {
      // Log error for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.error('AI API error:', error)
      }
      
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      )
    }
  }, 'ai')
}