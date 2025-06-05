import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

// Initialize Redis client with error handling
let redis: Redis | null = null
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
} catch (error) {
  console.warn('Rate limiting disabled: Redis configuration missing')
}

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@zenya/ratelimit',
}) : null

// Create different rate limiters for different endpoints
const rateLimiters = redis ? {
  // AI endpoints - more restrictive
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
    prefix: '@zenya/ai',
  }),
  
  // Auth endpoints - moderate restrictions
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: '@zenya/auth',
  }),
  
  // General API endpoints
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: '@zenya/api',
  }),
  
  // Waitlist - prevent spam
  waitlist: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, '1 h'),
    analytics: true,
    prefix: '@zenya/waitlist',
  }),
  
  // Contact form - prevent spam
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: '@zenya/contact',
  }),
} : null

export async function checkRateLimit(
  request: NextRequest,
  endpoint: 'ai' | 'auth' | 'api' | 'waitlist' | 'contact' = 'api'
) {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return { success: true, limit: 100, remaining: 100, reset: Date.now() }
  }

  // Skip if rate limiting is disabled or Redis is not configured
  if (process.env.RATE_LIMIT_ENABLED !== 'true' || !rateLimiters) {
    return { success: true, limit: 100, remaining: 100, reset: Date.now() }
  }

  // Get user identifier (IP or user ID)
  const identifier = request.headers.get('x-forwarded-for') ?? 
                    request.headers.get('x-real-ip') ?? 
                    'anonymous'

  // Use the appropriate rate limiter
  const limiter = rateLimiters?.[endpoint] || ratelimit

  // If no limiter is available (Redis not configured), allow the request
  if (!limiter) {
    return { success: true, limit: 100, remaining: 100, reset: Date.now() }
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    
    return { success, limit, remaining, reset }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open - allow request if rate limit check fails
    return { success: true, limit: 100, remaining: 100, reset: Date.now() }
  }
}

export function getRateLimitHeaders(result: {
  limit: number
  remaining: number
  reset: number
}) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': isNaN(result.reset) ? 'Invalid Date' : new Date(result.reset).toISOString(),
  }
}