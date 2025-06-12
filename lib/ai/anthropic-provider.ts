/**
 * Anthropic Provider Implementation
 */

import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, ProviderConfig } from './providers'

export class AnthropicProvider implements AIProvider {
  name = 'anthropic'
  private client: Anthropic

  constructor(config: ProviderConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      baseURL: config.baseURL,
    })
  }

  async chat(messages: any[], options?: any) {
    // Convert OpenAI format to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system')
    const userMessages = messages.filter(m => m.role !== 'system')

    const response = await this.client.messages.create({
      model: options?.model || 'claude-3-opus-20240229',
      messages: userMessages,
      system: systemMessage?.content,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 0.7,
      ...options,
    })

    const content = response.content[0]
    return (content && 'text' in content) ? content.text : ''
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    throw new Error('Anthropic does not support embeddings')
  }

  validateResponse(response: any): boolean {
    return response && typeof response === 'string' && response.length > 0
  }

  estimateCost(tokens: number): number {
    // Claude 3 Opus pricing: $15 per 1M input tokens, $75 per 1M output tokens
    // Using average estimate
    return (tokens / 1000000) * 45
  }
}