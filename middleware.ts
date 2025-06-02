import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Add security headers
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.openai.com https://www.google-analytics.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
  
  res.headers.set('Content-Security-Policy', csp)
  
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