import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthorizedDomain, getDomainError, getAuthorizedOrigins } from '@/lib/domain-verification'
import { detectSecurityThreats, getSecurityHeaders, generateCSP } from '@/lib/security'
import { performanceMonitor } from '@/lib/monitoring/performance'
import { validateCSRFToken, setCSRFToken } from '@/lib/security/csrf'

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
        message: 'Security policy violation detected',
        reasons: process.env.NODE_ENV === 'development' ? threatAnalysis.reasons : undefined,
        help: 'If you believe this is an error, please try refreshing the page or contact support.'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Security-Block': 'true',
          'X-Risk-Score': threatAnalysis.riskScore.toString()
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
  
  // Protect debug routes in production
  if (request.nextUrl.pathname.startsWith('/debug') && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Domain verification - ensure app only runs on authorized domains
  const hostname = request.headers.get('host') || request.headers.get('x-forwarded-host')
  
  // Skip domain verification for localhost development
  const isLocalhost = hostname?.includes('localhost') || hostname?.includes('127.0.0.1') || hostname?.includes('0.0.0.0')
  if (isLocalhost) {
    // Allow localhost without domain verification
  }
  // Special handling for Vercel deployments
  else if (process.env.VERCEL) {
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

  // Create response first
  const res = NextResponse.next()
  
  // Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
          })
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )
  
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
    // CSRF Protection for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const isValidCSRF = await validateCSRFToken(request)
      if (!isValidCSRF) {
        return new NextResponse(
          JSON.stringify({
            error: 'CSRF Token Invalid',
            message: 'Missing or invalid CSRF token',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
    }
    
    const origin = request.headers.get('origin')
    const authorizedOrigins = getAuthorizedOrigins()
    
    if (origin && authorizedOrigins.includes(origin)) {
      res.headers.set('Access-Control-Allow-Origin', origin)
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
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
  
  // Get and validate session
  let session = null
  try {
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      // Try to refresh the session
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
      session = refreshedSession
    } else {
      session = currentSession
    }
  } catch (error) {
    console.error('Session check error:', error)
    session = null
  }
  
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
  
  // If user is logged in and on landing or auth pages, redirect to learn page
  if (session && (request.nextUrl.pathname === '/landing' || isAuthPage)) {
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