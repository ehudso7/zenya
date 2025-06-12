import { OpenAIProvider, AnthropicProvider, CohereProvider, HuggingFaceProvider } from './providers'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// Mock external dependencies
jest.mock('openai')
jest.mock('@anthropic-ai/sdk')

describe('AI Providers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('OpenAIProvider', () => {
    let provider: OpenAIProvider
    let mockOpenAI: jest.Mocked<OpenAI>

    beforeEach(() => {
      mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'OpenAI response' } }],
              usage: { total_tokens: 100 },
            }),
          },
        },
      } as any
      ;(OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAI)
      
      provider = new OpenAIProvider('test-api-key')
    })

    it('should generate completion', async () => {
      const result = await provider.generateCompletion('Test prompt')
      
      expect(result).toEqual({
        content: 'OpenAI response',
        provider: 'openai',
        model: 'gpt-4o-mini',
        usage: { total_tokens: 100 },
      })
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Test prompt' }],
        temperature: 0.7,
        max_tokens: 200,
      })
    })

    it('should handle streaming responses', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield { choices: [{ delta: { content: 'Hello' } }] }
          yield { choices: [{ delta: { content: ' world' } }] }
        },
      }
      
      mockOpenAI.chat.completions.create.mockResolvedValue(mockStream as any)
      
      const result = await provider.generateCompletion('Test', { stream: true })
      
      let fullContent = ''
      if (result.stream) {
        for await (const chunk of result.stream) {
          fullContent += chunk
        }
      }
      
      expect(fullContent).toBe('Hello world')
    })

    it('should check health status', async () => {
      const health = await provider.checkHealth()
      expect(health).toBe(true)
      
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(new Error('API Error'))
      const unhealthy = await provider.checkHealth()
      expect(unhealthy).toBe(false)
    })
  })

  describe('AnthropicProvider', () => {
    let provider: AnthropicProvider
    let mockAnthropic: jest.Mocked<Anthropic>

    beforeEach(() => {
      mockAnthropic = {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [{ text: 'Anthropic response' }],
            usage: { input_tokens: 50, output_tokens: 50 },
          }),
        },
      } as any
      ;(Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(() => mockAnthropic)
      
      provider = new AnthropicProvider('test-api-key')
    })

    it('should generate completion', async () => {
      const result = await provider.generateCompletion('Test prompt')
      
      expect(result).toEqual({
        content: 'Anthropic response',
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
        usage: { total_tokens: 100 },
      })
      
      expect(mockAnthropic.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: 'Test prompt' }],
        max_tokens: 200,
        temperature: 0.7,
      })
    })
  })

  describe('CohereProvider', () => {
    let provider: CohereProvider

    beforeEach(() => {
      global.fetch = jest.fn()
      provider = new CohereProvider('test-api-key')
    })

    it('should generate completion', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: 'Cohere response',
          meta: { tokens: { input_tokens: 30, output_tokens: 20 } },
        }),
      })
      
      const result = await provider.generateCompletion('Test prompt')
      
      expect(result).toEqual({
        content: 'Cohere response',
        provider: 'cohere',
        model: 'command-light',
        usage: { total_tokens: 50 },
      })
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.cohere.ai/v1/generate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          },
        })
      )
    })

    it('should handle API errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      })
      
      await expect(provider.generateCompletion('Test')).rejects.toThrow('Cohere API error: 429')
    })
  })

  describe('HuggingFaceProvider', () => {
    let provider: HuggingFaceProvider

    beforeEach(() => {
      global.fetch = jest.fn()
      provider = new HuggingFaceProvider('test-api-key')
    })

    it('should generate completion', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([{
          generated_text: 'Test prompt HuggingFace response',
        }]),
      })
      
      const result = await provider.generateCompletion('Test prompt')
      
      expect(result).toEqual({
        content: 'HuggingFace response',
        provider: 'huggingface',
        model: 'microsoft/DialoGPT-medium',
        usage: { total_tokens: 0 },
      })
    })

    it('should handle empty responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([]),
      })
      
      const result = await provider.generateCompletion('Test prompt')
      
      expect(result.content).toBe('I apologize, but I was unable to generate a response.')
    })
  })
})