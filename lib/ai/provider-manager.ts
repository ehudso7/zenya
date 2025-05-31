import type { Mood, AIResponse } from '@/types'
import { generateAIResponse } from './openai'
import { generateClaudeResponse } from './anthropic'
import { generateHuggingFaceResponse, generateCohereResponse, getFallbackResponse } from './free-providers'

interface ProviderConfig {
  name: string
  isAvailable: () => boolean
  generate: (message: string, mood: Mood | null, context?: string) => Promise<AIResponse>
  cost: 'premium' | 'low' | 'free'
  priority: number
  requestCount?: number
  lastUsed?: Date
}

// Track usage for load balancing
const providerUsage = new Map<string, { count: number; lastReset: Date }>()

// Reset counts daily
function resetDailyLimits() {
  const now = new Date()
  providerUsage.forEach((usage, provider) => {
    const hoursSinceReset = (now.getTime() - usage.lastReset.getTime()) / (1000 * 60 * 60)
    if (hoursSinceReset >= 24) {
      usage.count = 0
      usage.lastReset = now
    }
  })
}

// Get provider usage
function getProviderUsage(provider: string): number {
  resetDailyLimits()
  return providerUsage.get(provider)?.count || 0
}

// Increment provider usage
function incrementProviderUsage(provider: string) {
  resetDailyLimits()
  const usage = providerUsage.get(provider) || { count: 0, lastReset: new Date() }
  usage.count++
  providerUsage.set(provider, usage)
}

// Define all available providers
const providers: ProviderConfig[] = [
  {
    name: 'openai',
    isAvailable: () => !!process.env.OPENAI_API_KEY,
    generate: generateAIResponse,
    cost: 'premium',
    priority: 1,
  },
  {
    name: 'anthropic',
    isAvailable: () => !!process.env.ANTHROPIC_API_KEY,
    generate: generateClaudeResponse,
    cost: 'low',
    priority: 2,
  },
  {
    name: 'cohere',
    isAvailable: () => !!process.env.COHERE_API_KEY && getProviderUsage('cohere') < 900, // Leave buffer for 1000/month limit
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
export async function generateSmartResponse(
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
      console.log(`Using ${selectedProvider.name} provider (${selectedProvider.cost} tier)`)
      incrementProviderUsage(selectedProvider.name)
      
      const response = await selectedProvider.generate(message, mood, context)
      
      // If premium provider returns error, try free alternatives
      if (response.message.includes('trouble connecting') && selectedProvider.cost === 'premium') {
        const freeAlternative = freeProviders[Math.floor(Math.random() * freeProviders.length)]
        if (freeAlternative) {
          console.log(`Premium provider failed, switching to ${freeAlternative.name}`)
          incrementProviderUsage(freeAlternative.name)
          const freeResponse = await freeAlternative.generate(message, mood, context)
          return { ...freeResponse, provider: freeAlternative.name }
        }
      }
      
      return { ...response, provider: selectedProvider.name }
    } catch (error) {
      console.error(`${selectedProvider.name} failed:`, error)
      // Continue to fallback
    }
  }
  
  // Ultimate fallback
  console.log('All providers failed, using fallback responses')
  return { ...getFallbackResponse(message, mood), provider: 'fallback' }
}

// Get provider statistics
export function getProviderStats() {
  resetDailyLimits()
  const stats: Record<string, any> = {}
  
  providers.forEach(provider => {
    stats[provider.name] = {
      available: provider.isAvailable(),
      cost: provider.cost,
      usage: getProviderUsage(provider.name),
      ...(provider.name === 'cohere' && { remaining: 1000 - getProviderUsage('cohere') })
    }
  })
  
  return stats
}