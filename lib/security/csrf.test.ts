import { NextRequest } from 'next/server'
import { 
  generateCSRFToken, 
  validateCSRFToken,
  csrfMiddleware 
} from './csrf'

// Mock cookies
const mockCookies = new Map<string, string>()
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: (name: string) => ({ value: mockCookies.get(name) }),
    set: (name: string, value: string) => mockCookies.set(name, value),
  })),
}))

describe('CSRF Protection', () => {
  beforeEach(() => {
    mockCookies.clear()
  })

  describe('generateCSRFToken', () => {
    it('should generate a 64-character hex token', () => {
      const token = generateCSRFToken()
      expect(token).toHaveLength(64)
      expect(token).toMatch(/^[a-f0-9]+$/)
    })

    it('should generate unique tokens', () => {
      const tokens = new Set()
      for (let i = 0; i < 100; i++) {
        tokens.add(generateCSRFToken())
      }
      expect(tokens.size).toBe(100)
    })
  })

  describe('validateCSRFToken', () => {
    const createRequest = (method: string, headers: Record<string, string> = {}) => {
      return {
        method,
        headers: new Headers(headers),
        clone: () => ({
          json: async () => ({}),
        }),
      } as unknown as NextRequest
    }

    it('should allow GET requests without token', async () => {
      const request = createRequest('GET')
      const isValid = await validateCSRFToken(request)
      expect(isValid).toBe(true)
    })

    it('should allow HEAD requests without token', async () => {
      const request = createRequest('HEAD')
      const isValid = await validateCSRFToken(request)
      expect(isValid).toBe(true)
    })

    it('should allow OPTIONS requests without token', async () => {
      const request = createRequest('OPTIONS')
      const isValid = await validateCSRFToken(request)
      expect(isValid).toBe(true)
    })

    it('should reject POST without token', async () => {
      const request = createRequest('POST')
      const isValid = await validateCSRFToken(request)
      expect(isValid).toBe(false)
    })

    it('should accept valid token in header', async () => {
      const token = 'test-token'
      mockCookies.set('zenya-csrf-token', token)
      
      const request = createRequest('POST', {
        'x-csrf-token': token,
      })
      
      const isValid = await validateCSRFToken(request)
      expect(isValid).toBe(true)
    })

    it('should reject mismatched tokens', async () => {
      mockCookies.set('zenya-csrf-token', 'token1')
      
      const request = createRequest('POST', {
        'x-csrf-token': 'token2',
      })
      
      const isValid = await validateCSRFToken(request)
      expect(isValid).toBe(false)
    })
  })

  describe('csrfMiddleware', () => {
    it('should return null for valid requests', async () => {
      const token = 'valid-token'
      mockCookies.set('zenya-csrf-token', token)
      
      const request = {
        method: 'POST',
        headers: new Headers({ 'x-csrf-token': token }),
        clone: () => ({ json: async () => ({}) }),
      } as unknown as NextRequest
      
      const response = await csrfMiddleware(request)
      expect(response).toBeNull()
    })

    it('should return 403 for invalid CSRF', async () => {
      const request = {
        method: 'POST',
        headers: new Headers(),
        clone: () => ({ json: async () => ({}) }),
      } as unknown as NextRequest
      
      const response = await csrfMiddleware(request)
      expect(response).not.toBeNull()
      expect(response?.status).toBe(403)
      
      const body = await response?.json()
      expect(body.error).toBe('Invalid CSRF token')
    })
  })
})