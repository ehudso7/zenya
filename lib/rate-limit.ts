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
} catch (_error) {
  // Rate limiting disabled: Redis configuration missing
}

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@zenya/ratelimit',
}) : null

// Production-grade rate limiters with tier-based limits
const rateLimiters = redis ? {
  // AI endpoints - tier-based restrictions
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 m'), // Increased for production load
    analytics: true,
    prefix: '@zenya/ai',
  }),
  
  // AI premium tier (for authenticated pro users)
  aiPremium: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, '1 m'),
    analytics: true,
    prefix: '@zenya/ai-premium',
  }),
  
  // Auth endpoints - strict but reasonable
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '5 m'), // 3 attempts per 5 minutes
    analytics: true,
    prefix: '@zenya/auth',
  }),
  
  // General API endpoints - generous for normal usage
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 m'), // 1000 requests per minute
    analytics: true,
    prefix: '@zenya/api',
  }),
  
  // Waitlist - strict spam prevention
  waitlist: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, '1 h'), // 1 signup per hour per IP
    analytics: true,
    prefix: '@zenya/waitlist',
  }),
  
  // Contact form - strict spam prevention  
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, '10 m'), // 1 message per 10 minutes
    analytics: true,
    prefix: '@zenya/contact',
  }),
  
  // File upload limits
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: '@zenya/upload',
  }),
  
  // Data export limits
  export: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, '1 h'),
    analytics: true,
    prefix: '@zenya/export',
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
  } catch (_error) {
    // Rate limit check failed - fail open
    // Allow request if rate limit check fails
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