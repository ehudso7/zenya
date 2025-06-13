/**
 * AI Provider Configuration and Registry
 */

export { OpenAIProvider } from './openai-provider'
export { ZenyaOpenAIProvider } from './zenya-openai-provider'
export { AnthropicProvider } from './anthropic-provider'
export { FreeModelProvider } from './free-provider'

export interface AIProvider {
  name: string
  chat(messages: any[], options?: any): Promise<any>
  generateEmbedding?(text: string): Promise<number[]>
  validateResponse?(response: any): boolean
  estimateCost?(tokens: number): number
}

export interface ProviderConfig {
  apiKey?: string
  baseURL?: string
  model?: string
  maxTokens?: number
  temperature?: number
}

export const defaultProviders = ['openai', 'anthropic', 'free'] as const
export type ProviderName = typeof defaultProviders[number]

export const providerConfigs: Record<ProviderName, ProviderConfig> = {
  openai: {
    model: 'gpt-4-turbo-preview',
    maxTokens: 4096,
    temperature: 0.7,
  },
  anthropic: {
    model: 'claude-3-opus-20240229',
    maxTokens: 4096,
    temperature: 0.7,
  },
  free: {
    model: 'mixtral-8x7b',
    maxTokens: 2048,
    temperature: 0.7,
  },
}