import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPublicPage = ['/landing', '/about', '/faq', '/contact', '/privacy', '/terms'].includes(request.nextUrl.pathname)
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  
  // If user is not logged in and trying to access protected pages
  if (!session && !isAuthPage && !isPublicPage && !isApiRoute) {
    // Redirect to landing page
    return NextResponse.redirect(new URL('/landing', request.url))
  }
  
  // If user is logged in and on landing page, redirect to dashboard
  if (session && request.nextUrl.pathname === '/landing') {
    return NextResponse.redirect(new URL('/', request.url))
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