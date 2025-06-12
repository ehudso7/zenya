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
import { aiProviderBreakers, retryManager } from '@/lib/ai/circuit-breaker'
import { trackAPICall, performanceMonitor } from '@/lib/monitoring/performance'
import { tracing } from '@/lib/monitoring/tracing'
import { semanticSearch } from '@/lib/ai/semantic-search'

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

// OpenAI provider implementation with circuit breaker
async function generateOpenAIResponse(
  message: string,
  mood: Mood | null,
  context?: string
): Promise<AIResponse> {
  return aiProviderBreakers.openai.execute(async () => {
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
  } catch (_error) {
    throw _error
  }
  })
}

// Anthropic provider implementation with circuit breaker
async function generateAnthropicResponse(
  message: string,
  mood: Mood | null,
  context?: string
): Promise<AIResponse> {
  return aiProviderBreakers.anthropic.execute(async () => {
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
  } catch (_error) {
    throw _error
  }
  })
}

// Hugging Face provider implementation with circuit breaker
async function generateHuggingFaceResponse(
  message: string,
  mood: Mood | null,
  _context?: string
): Promise<AIResponse> {
  return aiProviderBreakers.huggingface.execute(async () => {
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
  } catch (_error) {
    throw _error
  }
  })
}

// Cohere provider implementation with circuit breaker
async function generateCohereResponse(
  message: string,
  mood: Mood | null,
  _context?: string
): Promise<AIResponse> {
  return aiProviderBreakers.cohere.execute(async () => {
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
  } catch (_error) {
    throw _error
  }
  })
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

// Smart provider selection with load balancing and semantic context
async function generateSmartResponse(
  message: string,
  mood: Mood | null,
  context?: string,
  semanticContext?: any
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
      
      // Enhanced context with semantic search results
      const enhancedContext = semanticContext ? 
        `${context || ''}\n\nRelevant context from knowledge base:\n${
          semanticContext.results.map((r: any) => 
            `- ${r.content} (${r.context})`
          ).join('\n')
        }\n\nRelated concepts: ${semanticContext.context.relatedConcepts.join(', ')}` 
        : context
        
      const response = await selectedProvider.generate(message, mood, enhancedContext)
      
      // If provider returns error message, try free alternatives
      if (response.message.includes('trouble connecting') && selectedProvider.cost === 'premium') {
        const freeAlternative = freeProviders[Math.floor(Math.random() * freeProviders.length)]
        if (freeAlternative) {
          incrementProviderUsage(freeAlternative.name)
          const freeResponse = await freeAlternative.generate(message, mood, enhancedContext)
          return { ...freeResponse, provider: freeAlternative.name }
        }
      }
      
      // Add semantic suggestions to response
      const enhancedResponse = semanticContext ? {
        ...response,
        suggestions: [
          ...(response.suggestions || []),
          ...semanticContext.suggestions.slice(0, 2)
        ]
      } : response
      
      return { ...enhancedResponse, provider: selectedProvider.name }
    } catch (_error) {
      // Provider failed, will try fallback
      // Continue to fallback
    }
  }
  
  // Ultimate fallback
  return { ...getFallbackResponse(message, mood), provider: 'fallback' }
}

// Get provider statistics
function _getProviderStats() {
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
    return trackAPICall('/api/ai', 'POST', async () => {
    try {
      const startTime = performance.now()
      performanceMonitor.trackUserInteraction('ai_request_started')
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

      // Enhanced semantic search integration
      const semanticContext = await semanticSearch.enhancedSearch({
        query: message,
        userId: user.id,
        difficulty: mood === '😴' ? 3 : 5,
        includeExamples: true,
        limit: 3
      })

      // Use smart provider selection with advanced retry logic and tracing
      const response = await tracing.traceAIOperation(
        'smart_provider',
        'generate_response',
        async (span) => {
          span.setAttributes({
            'ai.message_length': message.length,
            'ai.mood': mood || 'none',
            'ai.has_context': !!context,
            'ai.semantic_results_count': semanticContext.results.length,
            'ai.semantic_difficulty': semanticContext.context.difficulty
          })

          return await retryManager.execute(
            () => generateSmartResponse(message, mood as Mood | null, context, semanticContext),
            (error, attempt) => {
              // Retry on rate limits and temporary failures
              const shouldRetry = error.message.includes('rate limit') || 
                                 error.message.includes('temporary') ||
                                 error.message.includes('timeout')
              
              if (shouldRetry && attempt <= 3) {
                span.addEvent('ai_request_retry', {
                  'retry.attempt': attempt,
                  'retry.error': error.message
                })
                
                performanceMonitor.trackMetric({
                  name: 'ai_request_retry',
                  value: attempt,
                  unit: 'count',
                  metadata: { error: error.message, provider: 'unknown' }
                })
              }
              
              return shouldRetry && attempt <= 3
            }
          )
        },
        {
          model: 'smart_routing',
          promptTokens: message.length / 4 // Rough token estimate
        }
      )

      // Track performance metrics with trace context
      const duration = performance.now() - startTime
      const traceContext = tracing.getCurrentTraceContext()
      
      performanceMonitor.trackMetric({
        name: 'ai_response_time',
        value: duration,
        unit: 'ms',
        metadata: { 
          provider: response.provider, 
          mood: mood || 'none',
          traceId: traceContext?.traceId || 'unknown'
        }
      })
      
      tracing.addAttributes({
        'ai.response_provider': response.provider,
        'ai.response_length': response.message.length,
        'ai.suggestions_count': response.suggestions?.length || 0
      })
      
      performanceMonitor.trackUserInteraction('ai_request_completed', response.provider, 1)

      return NextResponse.json(response)
    } catch (_error) {
      // Enhanced error tracking and monitoring with tracing
      const error = _error as Error
      
      tracing.recordException(error, {
        'error.component': 'ai_generation',
        'error.operation': 'smart_provider_selection'
      })
      
      performanceMonitor.trackError(error, 'ai_generation')
      
      console.error('AI generation failed:', {
        error: error.message,
        stack: error.stack?.substring(0, 500),
        timestamp: new Date().toISOString(),
        traceId: tracing.getCurrentTraceContext()?.traceId || 'unknown'
      })
      
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      )
    }
    })
  }, 'ai')
}