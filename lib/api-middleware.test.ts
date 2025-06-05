import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, withAuth, withTryCatch, createAuthClient } from './api-middleware'
import * as rateLimitModule from './rate-limit'
import { createServerClient } from '@supabase/ssr'

// Mock dependencies
jest.mock('./rate-limit')
jest.mock('@supabase/ssr')

describe('API Middleware', () => {
  const mockRequest = (headers: Record<string, string> = {}) => {
    return {
      headers: {
        get: (key: string) => headers[key] || null,
      },
      cookies: {
        getAll: jest.fn(() => []),
      },
    } as unknown as NextRequest
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('withRateLimit', () => {
    it('should allow request when rate limit not exceeded', async () => {
      const mockCheckRateLimit = jest.spyOn(rateLimitModule, 'checkRateLimit')
      mockCheckRateLimit.mockResolvedValue({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
      })

      const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
      const request = mockRequest()

      const response = await withRateLimit(request, handler)

      expect(mockCheckRateLimit).toHaveBeenCalledWith(request, 'api')
      expect(handler).toHaveBeenCalledWith(request)
      expect(response.status).toBe(200)
    })

    it('should block request when rate limit exceeded', async () => {
      const mockCheckRateLimit = jest.spyOn(rateLimitModule, 'checkRateLimit')
      const resetTime = Date.now() + 60000
      mockCheckRateLimit.mockResolvedValue({
        success: false,
        limit: 100,
        remaining: 0,
        reset: resetTime,
      })

      const handler = jest.fn()
      const request = mockRequest()

      const response = await withRateLimit(request, handler, 'ai')

      expect(mockCheckRateLimit).toHaveBeenCalledWith(request, 'ai')
      expect(handler).not.toHaveBeenCalled()
      expect(response.status).toBe(429)
      
      const body = await response.json()
      expect(body.error).toBe('Too many requests')
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
    })

    it('should handle rate limit check errors gracefully', async () => {
      const mockCheckRateLimit = jest.spyOn(rateLimitModule, 'checkRateLimit')
      mockCheckRateLimit.mockRejectedValue(new Error('Redis error'))

      const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
      const request = mockRequest()

      const response = await withRateLimit(request, handler)

      // Should fail open and allow the request
      expect(handler).toHaveBeenCalled()
      expect(response.status).toBe(200)
    })

    it('should use custom endpoint for rate limiting', async () => {
      const mockCheckRateLimit = jest.spyOn(rateLimitModule, 'checkRateLimit')
      mockCheckRateLimit.mockResolvedValue({
        success: true,
        limit: 20,
        remaining: 19,
        reset: Date.now() + 60000,
      })

      const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
      const request = mockRequest()

      await withRateLimit(request, handler, 'waitlist')

      expect(mockCheckRateLimit).toHaveBeenCalledWith(request, 'waitlist')
    })
  })

  describe('withAuth', () => {
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
    }

    beforeEach(() => {
      ;(createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient)
    })

    it('should allow authenticated requests', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123', email: 'test@example.com' } },
        error: null,
      })

      const handler = jest.fn((req, data) => {
        expect(data.user).toEqual({ id: 'user123', email: 'test@example.com' })
        return NextResponse.json({ success: true })
      })

      const request = mockRequest()
      const response = await withAuth(request, handler)

      expect(response.status).toBe(200)
      expect(handler).toHaveBeenCalled()
    })

    it('should reject unauthenticated requests', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const handler = jest.fn()
      const request = mockRequest()

      const response = await withAuth(request, handler)

      expect(response.status).toBe(401)
      expect(handler).not.toHaveBeenCalled()
      
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })

    it('should handle auth errors', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth service error'),
      })

      const handler = jest.fn()
      const request = mockRequest()

      const response = await withAuth(request, handler)

      expect(response.status).toBe(401)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should pass additional data to handler', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      })

      const additionalData = { role: 'admin', permissions: ['read', 'write'] }
      const handler = jest.fn((req, data) => {
        expect(data.user.id).toBe('user123')
        expect(data.role).toBe('admin')
        expect(data.permissions).toEqual(['read', 'write'])
        return NextResponse.json({ success: true })
      })

      const request = mockRequest()
      await withAuth(request, handler, additionalData)

      expect(handler).toHaveBeenCalled()
    })
  })

  describe('withTryCatch', () => {
    it('should handle successful requests', async () => {
      const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
      const request = mockRequest()

      const response = await withTryCatch(request, handler)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
    })

    it('should catch and handle errors', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('Something went wrong'))
      const request = mockRequest()

      const response = await withTryCatch(request, handler)

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.error).toBe('Internal server error')
    })

    it('should log errors in development', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Test error')
      const handler = jest.fn().mockRejectedValue(error)
      const request = mockRequest()

      await withTryCatch(request, handler)

      expect(consoleSpy).toHaveBeenCalledWith('API Error:', error)
      
      consoleSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    })

    it('should handle non-Error objects', async () => {
      const handler = jest.fn().mockRejectedValue('String error')
      const request = mockRequest()

      const response = await withTryCatch(request, handler)

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.error).toBe('Internal server error')
    })
  })

  describe('createAuthClient', () => {
    it('should create a Supabase client with correct config', () => {
      const mockCookieStore = {
        getAll: jest.fn(() => [
          { name: 'session', value: 'abc123' },
        ]),
        set: jest.fn(),
      }

      const request = {
        cookies: mockCookieStore,
      } as unknown as NextRequest

      createAuthClient(request)

      expect(createServerClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      )
    })

    it('should handle cookie operations', () => {
      const mockCookieStore = {
        getAll: jest.fn(() => []),
        set: jest.fn(),
      }

      const request = {
        cookies: mockCookieStore,
      } as unknown as NextRequest

      ;(createServerClient as jest.Mock).mockImplementation((url, key, options) => {
        // Test getAll
        const cookies = options.cookies.getAll()
        expect(cookies).toEqual([])

        // Test setAll
        options.cookies.setAll([
          { name: 'test', value: 'value', options: { httpOnly: true } },
        ])

        return mockSupabaseClient
      })

      createAuthClient(request)

      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'test',
        value: 'value',
        httpOnly: true,
      })
    })
  })

  describe('Middleware composition', () => {
    it('should compose multiple middleware functions', async () => {
      // Setup rate limit to pass
      jest.spyOn(rateLimitModule, 'checkRateLimit').mockResolvedValue({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
      })

      // Setup auth to pass
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123' } },
            error: null,
          }),
        },
      }
      ;(createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient)

      const request = mockRequest()

      // Compose middlewares
      const response = await withRateLimit(request, async (req) => {
        return withAuth(req, async (req, data) => {
          return withTryCatch(req, async () => {
            return NextResponse.json({ 
              success: true, 
              userId: data.user.id,
            })
          })
        })
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.userId).toBe('user123')
    })
  })
})