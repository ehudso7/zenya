/**
 * OpenAI Provider Implementation
 */

import OpenAI from 'openai'
import type { AIProvider, ProviderConfig } from './providers'

export class OpenAIProvider implements AIProvider {
  name = 'openai'
  private client: OpenAI

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.baseURL,
    })
  }

  async chat(messages: any[], options?: any) {
    const response = await this.client.chat.completions.create({
      model: options?.model || 'gpt-4-turbo-preview',
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 4096,
      ...options,
    })

    return response.choices[0]?.message?.content || ''
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })

    return response.data[0].embedding
  }

  validateResponse(response: any): boolean {
    return response && typeof response === 'string' && response.length > 0
  }

  estimateCost(tokens: number): number {
    // GPT-4 Turbo pricing: $0.01 per 1K input tokens, $0.03 per 1K output tokens
    // Using average estimate
    return (tokens / 1000) * 0.02
  }
}