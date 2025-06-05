// Mock the Upstash modules before importing our module
jest.mock('@upstash/ratelimit')
jest.mock('@upstash/redis')

import { NextRequest } from 'next/server'
import { checkRateLimit, getRateLimitHeaders } from './rate-limit'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Setup mocks
const mockLimit = jest.fn()
const mockRatelimitInstance = { limit: mockLimit }
const mockRatelimitConstructor = jest.fn(() => mockRatelimitInstance)
;(mockRatelimitConstructor as any).slidingWindow = jest.fn()
;(Ratelimit as jest.MockedClass<typeof Ratelimit>) = mockRatelimitConstructor as any
;(Redis as jest.MockedClass<typeof Redis>) = jest.fn(() => ({})) as any

describe('Rate Limiting', () => {
  const mockRequest = (headers: Record<string, string> = {}) => {
    return {
      headers: {
        get: (key: string) => headers[key] || null,
      },
    } as NextRequest
  }

  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    // Ensure we're in production mode with rate limiting enabled and Redis configured
    process.env = { 
      ...originalEnv, 
      NODE_ENV: 'production', 
      RATE_LIMIT_ENABLED: 'true',
      UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'test-token'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('checkRateLimit', () => {
    describe('Development Mode', () => {
      it('should skip rate limiting in development', async () => {
        process.env = { ...originalEnv, NODE_ENV: 'development' }
        const request = mockRequest()
        
        const result = await checkRateLimit(request)
        
        expect(result).toEqual({
          success: true,
          limit: 100,
          remaining: 100,
          reset: expect.any(Number),
        })
        expect(mockLimit).not.toHaveBeenCalled()
      })
    })

    describe('Disabled Rate Limiting', () => {
      it('should skip when RATE_LIMIT_ENABLED is not true', async () => {
        process.env = { ...originalEnv, NODE_ENV: 'production', RATE_LIMIT_ENABLED: 'false' }
        const request = mockRequest()
        
        const result = await checkRateLimit(request)
        
        expect(result).toEqual({
          success: true,
          limit: 100,
          remaining: 100,
          reset: expect.any(Number),
        })
        expect(mockLimit).not.toHaveBeenCalled()
      })

      it('should skip when RATE_LIMIT_ENABLED is undefined', async () => {
        process.env = { ...originalEnv, NODE_ENV: 'production', UPSTASH_REDIS_REST_URL: 'test', UPSTASH_REDIS_REST_TOKEN: 'test' }
        const request = mockRequest()
        
        const result = await checkRateLimit(request)
        
        expect(result).toEqual({
          success: true,
          limit: 100,
          remaining: 100,
          reset: expect.any(Number),
        })
        expect(mockLimit).not.toHaveBeenCalled()
      })
    })

    describe('Error Handling', () => {
      it('should fail open when rate limit check throws error', async () => {
        const request = mockRequest()
        mockLimit.mockRejectedValue(new Error('Redis connection failed'))
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        
        const result = await checkRateLimit(request)
        
        expect(result).toEqual({
          success: true,
          limit: 100,
          remaining: 100,
          reset: expect.any(Number),
        })
        
        consoleSpy.mockRestore()
      })

      it('should handle various error types gracefully', async () => {
        const request = mockRequest()
        const errors = [
          new Error('Network timeout'),
          new TypeError('Cannot read property'),
          { message: 'Unknown error' },
          null,
          undefined,
        ]
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        
        for (const error of errors) {
          mockLimit.mockRejectedValueOnce(error)
          
          const result = await checkRateLimit(request)
          
          expect(result.success).toBe(true)
          expect(result.limit).toBe(100)
          expect(result.remaining).toBe(100)
        }
        
        consoleSpy.mockRestore()
      })
    })
  })

  describe('getRateLimitHeaders', () => {
    it('should return correct headers for rate limit result', () => {
      const reset = Date.now() + 60000
      const result = {
        limit: 30,
        remaining: 25,
        reset,
      }
      
      const headers = getRateLimitHeaders(result)
      
      expect(headers).toEqual({
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': '25',
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      })
    })

    it('should handle edge cases in header values', () => {
      const testCases = [
        { limit: 0, remaining: 0, reset: 0 },
        { limit: Number.MAX_SAFE_INTEGER, remaining: 1, reset: Date.now() },
        { limit: -1, remaining: -1, reset: Date.now() - 10000 },
      ]
      
      testCases.forEach(testCase => {
        const headers = getRateLimitHeaders(testCase)
        
        expect(headers['X-RateLimit-Limit']).toBe(testCase.limit.toString())
        expect(headers['X-RateLimit-Remaining']).toBe(testCase.remaining.toString())
        expect(headers['X-RateLimit-Reset']).toBe(new Date(testCase.reset).toISOString())
      })
    })

    it('should handle invalid date values', () => {
      const result = {
        limit: 30,
        remaining: 25,
        reset: NaN,
      }
      
      const headers = getRateLimitHeaders(result)
      
      expect(headers['X-RateLimit-Reset']).toBe('Invalid Date')
    })
  })
})