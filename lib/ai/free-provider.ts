/**
 * Free Model Provider Implementation
 */

import type { AIProvider, ProviderConfig } from './providers'

export class FreeModelProvider implements AIProvider {
  name = 'free'
  private baseURL: string

  constructor(config: ProviderConfig) {
    this.baseURL = config.baseURL || 'https://api.groq.com/openai/v1'
  }

  async chat(messages: any[], options?: any) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: options?.model || 'mixtral-8x7b-32768',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2048,
        ...options,
      }),
    })

    if (!response.ok) {
      throw new Error(`Free model API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    throw new Error('Free models do not support embeddings')
  }

  validateResponse(response: any): boolean {
    return response && typeof response === 'string' && response.length > 0
  }

  estimateCost(_tokens: number): number {
    return 0 // Free tier
  }
}