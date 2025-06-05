import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitHeaders } from './rate-limit'
import { isAuthorizedDomain, getDomainError } from './domain-verification'

export async function withRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<Response>,
  endpoint: 'ai' | 'auth' | 'api' | 'waitlist' | 'contact' = 'api'
) {
  // Verify domain for API access
  const hostname = request.headers.get('host') || request.headers.get('x-forwarded-host')
  if (!isAuthorizedDomain(hostname)) {
    return NextResponse.json(
      { 
        error: 'Unauthorized Domain',
        message: getDomainError()
      },
      { status: 403 }
    )
  }

  // Check rate limit
  const rateLimitResult = await checkRateLimit(request, endpoint)
  
  // If rate limit exceeded, return 429
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: new Date(rateLimitResult.reset).toISOString()
      },
      { 
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult)
      }
    )
  }

  // Execute the handler
  try {
    const response = await handler(request)
    
    // Clone the response to add headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers)
    })
    
    // Add rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult)
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value)
    })
    
    // Add performance headers
    newResponse.headers.set('X-Content-Type-Options', 'nosniff')
    newResponse.headers.set('X-Frame-Options', 'DENY')
    newResponse.headers.set('X-XSS-Protection', '1; mode=block')
    
    // Add timing header for performance monitoring
    if (process.env.NODE_ENV === 'development') {
      const endTime = Date.now()
      const startTime = parseInt(request.headers.get('x-request-start') || Date.now().toString())
      newResponse.headers.set('X-Response-Time', `${endTime - startTime}ms`)
    }
    
    return newResponse
  } catch (error) {
    // Error will be monitored by error tracking service
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}