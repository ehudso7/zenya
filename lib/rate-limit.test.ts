import { NextRequest } from 'next/server'

// Mock the Upstash modules before importing our module
const mockLimit = jest.fn()
const mockRatelimit = jest.fn(() => ({
  limit: mockLimit,
}))
mockRatelimit.slidingWindow = jest.fn()

jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: mockRatelimit,
}))

jest.mock('@upstash/redis', () => ({
  Redis: jest.fn(() => ({})),
}))

// Now import our module after mocks are set up
import { checkRateLimit, getRateLimitHeaders } from './rate-limit'

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

    describe('Identifier Resolution', () => {
      it('should use x-forwarded-for header as identifier', async () => {
        const request = mockRequest({ 'x-forwarded-for': '192.168.1.1' })
        mockLimit.mockResolvedValue({
          success: true,
          limit: 30,
          remaining: 29,
          reset: Date.now() + 60000,
        })
        
        await checkRateLimit(request)
        
        expect(mockLimit).toHaveBeenCalledWith('192.168.1.1')
      })

      it('should use x-real-ip header when x-forwarded-for is not available', async () => {
        const request = mockRequest({ 'x-real-ip': '10.0.0.1' })
        mockLimit.mockResolvedValue({
          success: true,
          limit: 30,
          remaining: 29,
          reset: Date.now() + 60000,
        })
        
        await checkRateLimit(request)
        
        expect(mockLimit).toHaveBeenCalledWith('10.0.0.1')
      })

      it('should use anonymous as identifier when no IP headers are present', async () => {
        const request = mockRequest()
        mockLimit.mockResolvedValue({
          success: true,
          limit: 30,
          remaining: 29,
          reset: Date.now() + 60000,
        })
        
        await checkRateLimit(request)
        
        expect(mockLimit).toHaveBeenCalledWith('anonymous')
      })

      it('should prioritize x-forwarded-for over x-real-ip', async () => {
        const request = mockRequest({
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '10.0.0.1',
        })
        mockLimit.mockResolvedValue({
          success: true,
          limit: 30,
          remaining: 29,
          reset: Date.now() + 60000,
        })
        
        await checkRateLimit(request)
        
        expect(mockLimit).toHaveBeenCalledWith('192.168.1.1')
      })
    })

    describe('Endpoint-specific Rate Limiting', () => {
      const endpoints = ['ai', 'auth', 'api', 'waitlist', 'contact'] as const
      
      endpoints.forEach(endpoint => {
        it(`should use ${endpoint} rate limiter when specified`, async () => {
          const request = mockRequest()
          mockLimit.mockResolvedValue({
            success: true,
            limit: 20,
            remaining: 19,
            reset: Date.now() + 60000,
          })
          
          await checkRateLimit(request, endpoint)
          
          expect(mockLimit).toHaveBeenCalled()
        })
      })

      it('should use default rate limiter for unknown endpoint', async () => {
        const request = mockRequest()
        mockLimit.mockResolvedValue({
          success: true,
          limit: 10,
          remaining: 9,
          reset: Date.now() + 60000,
        })
        
        await checkRateLimit(request, 'unknown' as any)
        
        expect(mockLimit).toHaveBeenCalled()
      })
    })

    describe('Success and Failure Cases', () => {
      it('should return success when limit is not exceeded', async () => {
        const request = mockRequest()
        const reset = Date.now() + 60000
        mockLimit.mockResolvedValue({
          success: true,
          limit: 30,
          remaining: 25,
          reset,
        })
        
        const result = await checkRateLimit(request)
        
        expect(result).toEqual({
          success: true,
          limit: 30,
          remaining: 25,
          reset,
        })
      })

      it('should return failure when limit is exceeded', async () => {
        const request = mockRequest()
        const reset = Date.now() + 60000
        mockLimit.mockResolvedValue({
          success: false,
          limit: 30,
          remaining: 0,
          reset,
        })
        
        const result = await checkRateLimit(request)
        
        expect(result).toEqual({
          success: false,
          limit: 30,
          remaining: 0,
          reset,
        })
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
        expect(consoleSpy).toHaveBeenCalledWith('Rate limit check failed:', expect.any(Error))
        
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

    describe('Rate Limiter Configuration', () => {
      it('should create rate limiters with correct configurations', () => {
        // The rate limiters are created on module import
        expect(mockRatelimit).toHaveBeenCalledTimes(6) // default + 5 endpoints
        expect(mockRatelimit.slidingWindow).toHaveBeenCalledWith(10, '10 s')
        expect(mockRatelimit.slidingWindow).toHaveBeenCalledWith(20, '1 m')
        expect(mockRatelimit.slidingWindow).toHaveBeenCalledWith(5, '1 m')
        expect(mockRatelimit.slidingWindow).toHaveBeenCalledWith(30, '1 m')
        expect(mockRatelimit.slidingWindow).toHaveBeenCalledWith(2, '1 h')
        expect(mockRatelimit.slidingWindow).toHaveBeenCalledWith(3, '1 h')
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

  describe('Integration Scenarios', () => {
    it('should handle concurrent requests from same IP', async () => {
      const request = mockRequest({ 'x-forwarded-for': '192.168.1.1' })
      let callCount = 0
      
      mockLimit.mockImplementation(() => {
        callCount++
        return Promise.resolve({
          success: callCount <= 5,
          limit: 10,
          remaining: Math.max(0, 10 - callCount),
          reset: Date.now() + 10000,
        })
      })
      
      const results = await Promise.all([
        checkRateLimit(request),
        checkRateLimit(request),
        checkRateLimit(request),
        checkRateLimit(request),
        checkRateLimit(request),
      ])
      
      expect(results[0].success).toBe(true)
      expect(results[4].success).toBe(true)
      expect(mockLimit).toHaveBeenCalledTimes(5)
    })

    it('should handle different endpoints for same IP', async () => {
      const request = mockRequest({ 'x-forwarded-for': '192.168.1.1' })
      mockLimit.mockResolvedValue({
        success: true,
        limit: 30,
        remaining: 29,
        reset: Date.now() + 60000,
      })
      
      await checkRateLimit(request, 'api')
      await checkRateLimit(request, 'ai')
      await checkRateLimit(request, 'auth')
      
      expect(mockLimit).toHaveBeenCalledTimes(3)
      expect(mockLimit).toHaveBeenCalledWith('192.168.1.1')
    })
  })
})