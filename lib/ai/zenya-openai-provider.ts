/**
 * Zenya-Enhanced OpenAI Provider with Fine-Tuned Model Support
 */

import OpenAI from 'openai'
import type { AIProvider, ProviderConfig } from './providers'
import { zenyaModelSelector, type UserContext } from './zenya-model-config'
import { performanceMonitor } from '@/lib/monitoring/performance'

export interface ZenyaChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  user?: UserContext
  variant?: 'zenya-chat' | 'standard' | 'zenya-chat-fallback'
  [key: string]: any
}

export class ZenyaOpenAIProvider implements AIProvider {
  name = 'zenya-openai'
  private client: OpenAI
  private fallbackModel = 'gpt-3.5-turbo'

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.baseURL,
    })
  }

  /**
   * Enhanced chat method with fine-tuned model support and monitoring
   */
  async chat(messages: any[], options?: ZenyaChatOptions): Promise<string> {
    const startTime = Date.now()
    const user = options?.user
    const requestId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Select appropriate model based on user context
    const model = options?.model || zenyaModelSelector.getModel(user)
    const isFineTuned = model.startsWith('ft:')
    
    // Log interaction start
    if (process.env.NODE_ENV === 'development') {
      console.log('zenya.chat.started', {
        requestId,
        userId: user?.id,
        model,
        isFineTuned,
        variant: options?.variant || 'zenya-chat',
        messageCount: messages.length
      })
    }

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1024,
        ...(user?.id && { user: user.id })
      })

      const content = response.choices[0]?.message?.content || ''
      const tokensUsed = response.usage?.total_tokens || 0
      const duration = Date.now() - startTime

      // Log successful interaction in development
      if (process.env.NODE_ENV === 'development') {
        console.log('zenya.chat.completed', {
          requestId,
          userId: user?.id,
          model,
          isFineTuned,
          tokensUsed,
          duration,
          variant: options?.variant || 'zenya-chat'
        })
      }

      // Track performance metrics
      performanceMonitor.trackMetric({
        name: 'ai.zenya.chat_duration',
        value: duration,
        unit: 'ms',
        metadata: {
          model,
          isFineTuned: isFineTuned.toString(),
          tokensUsed: tokensUsed.toString()
        }
      })

      performanceMonitor.trackMetric({
        name: 'ai.zenya.tokens',
        value: tokensUsed,
        unit: 'tokens',
        metadata: {
          model,
          isFineTuned: isFineTuned.toString(),
          userId: user?.id || 'anonymous'
        }
      })

      // Track model usage for A/B testing
      if (isFineTuned) {
        performanceMonitor.trackMetric({
          name: 'ai.zenya.fine_tuned_usage',
          value: 1,
          unit: 'count',
          metadata: {
            userId: user?.id || 'anonymous',
            segment: user?.segment || 'unknown'
          }
        })
      }

      return content
    } catch (error) {
      const duration = Date.now() - startTime
      
      console.error('zenya.chat.failed', {
        requestId,
        userId: user?.id,
        model,
        isFineTuned,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      // Track error metric
      performanceMonitor.trackMetric({
        name: 'ai.zenya.errors',
        value: 1,
        unit: 'count',
        metadata: {
          model,
          isFineTuned: isFineTuned.toString(),
          errorType: error instanceof Error ? error.name : 'unknown'
        }
      })

      // If using fine-tuned model, retry with fallback
      if (isFineTuned && model !== this.fallbackModel) {
        if (process.env.NODE_ENV === 'development') {
          console.log('zenya.chat.fallback', {
            requestId,
            userId: user?.id,
            fromModel: model,
            toModel: this.fallbackModel
          })
        }

        return this.chat(messages, {
          ...options,
          model: this.fallbackModel,
          variant: 'zenya-chat-fallback'
        })
      }

      throw error
    }
  }

  /**
   * Generate embeddings using OpenAI's embedding model
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const startTime = Date.now()
    
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      })

      const duration = Date.now() - startTime
      
      performanceMonitor.trackMetric({
        name: 'ai.zenya.embedding_duration',
        value: duration,
        unit: 'ms'
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('zenya.embedding.failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Validate response content
   */
  validateResponse(response: any): boolean {
    return response && typeof response === 'string' && response.length > 0
  }

  /**
   * Estimate cost based on model and tokens
   */
  estimateCost(tokens: number, model?: string): number {
    // Fine-tuned model pricing (typically 3x the base model)
    if (model?.startsWith('ft:')) {
      // GPT-3.5 Turbo fine-tuned: ~$0.012 per 1K input, $0.016 per 1K output
      return (tokens / 1000) * 0.014
    }
    
    // Standard GPT-3.5 Turbo pricing: $0.0005 per 1K input, $0.0015 per 1K output
    if (model === 'gpt-3.5-turbo') {
      return (tokens / 1000) * 0.001
    }
    
    // GPT-4 Turbo pricing: $0.01 per 1K input, $0.03 per 1K output
    return (tokens / 1000) * 0.02
  }

  /**
   * Get current model configuration
   */
  getModelConfig() {
    return zenyaModelSelector.getConfig()
  }

  /**
   * Update model configuration at runtime
   */
  updateModelConfig(updates: any) {
    zenyaModelSelector.updateConfig(updates)
  }
}