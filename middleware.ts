import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthorizedDomain, getDomainError, getAuthorizedOrigins } from '@/lib/domain-verification'
import { detectSecurityThreats, getSecurityHeaders, generateCSP } from '@/lib/security'
import { performanceMonitor } from '@/lib/monitoring/performance'

export async function middleware(request: NextRequest) {
  const startTime = performance.now()
  
  // Advanced security threat detection
  const threatAnalysis = detectSecurityThreats(request)
  
  if (threatAnalysis.isThreat && threatAnalysis.riskScore > 80) {
    // Block high-risk requests immediately
    console.warn('Blocked high-risk request:', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      threats: threatAnalysis.reasons,
      riskScore: threatAnalysis.riskScore,
      path: request.nextUrl.pathname
    })
    
    return new NextResponse(
      JSON.stringify({
        error: 'Request Blocked',
        message: 'Security policy violation detected'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Security-Block': 'true'
        }
      }
    )
  }
  
  // Log medium-risk requests for monitoring
  if (threatAnalysis.isThreat && threatAnalysis.riskScore > 50) {
    console.warn('Medium-risk request detected:', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      threats: threatAnalysis.reasons,
      riskScore: threatAnalysis.riskScore,
      path: request.nextUrl.pathname
    })
  }
  
  // Domain verification - ensure app only runs on authorized domains
  const hostname = request.headers.get('host') || request.headers.get('x-forwarded-host')
  
  // Special handling for Vercel deployments
  if (process.env.VERCEL) {
    // Allow all Vercel deployments during preview/development
    if (process.env.VERCEL_ENV !== 'production' && hostname?.includes('.vercel.app')) {
      // Continue without domain check
    } else if (!isAuthorizedDomain(hostname)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Unauthorized Domain',
          message: getDomainError(),
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
  } else if (!isAuthorizedDomain(hostname)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Unauthorized Domain',
        message: getDomainError(),
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Apply comprehensive security headers
  const securityHeaders = getSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value)
  })
  
  // Generate dynamic Content Security Policy
  const csp = generateCSP()
  res.headers.set('Content-Security-Policy', csp)
  
  // Add security monitoring headers
  res.headers.set('X-Security-Score', threatAnalysis.riskScore.toString())
  if (threatAnalysis.isThreat) {
    res.headers.set('X-Security-Threats', threatAnalysis.reasons.join(','))
  }
  
  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const authorizedOrigins = getAuthorizedOrigins()
    
    if (origin && authorizedOrigins.includes(origin)) {
      res.headers.set('Access-Control-Allow-Origin', origin)
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.headers.set('Access-Control-Allow-Credentials', 'true')
    } else if (origin) {
      // Reject requests from unauthorized origins
      return new NextResponse(
        JSON.stringify({
          error: 'CORS Policy Violation',
          message: 'This API can only be accessed from zenyaai.com',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: res.headers })
    }
  }
  
  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPublicPage = [
    '/',
    '/landing', 
    '/about', 
    '/faq', 
    '/contact', 
    '/privacy', 
    '/terms',
  ].includes(request.nextUrl.pathname)
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isPublicApiRoute = [
    '/api/waitlist',
    '/api/curriculums'
  ].includes(request.nextUrl.pathname)
  
  // If user is not logged in and trying to access protected pages
  if (!session && !isAuthPage && !isPublicPage && !isPublicApiRoute) {
    if (isApiRoute) {
      // Return 401 for protected API routes
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Redirect to landing page
    return NextResponse.redirect(new URL('/landing', request.url))
  }
  
  // If user is logged in and on landing page, redirect to learn page
  if (session && request.nextUrl.pathname === '/landing') {
    return NextResponse.redirect(new URL('/learn', request.url))
  }
  
  // Track middleware performance
  const duration = performance.now() - startTime
  if (typeof window === 'undefined') {
    // Server-side performance tracking
    performanceMonitor.trackMetric({
      name: 'middleware_duration',
      value: duration,
      unit: 'ms',
      metadata: {
        path: request.nextUrl.pathname,
        method: request.method,
        threatScore: threatAnalysis.riskScore
      }
    })
  }
  
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}