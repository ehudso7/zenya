import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user has visited before (simple cookie check)
  const hasVisited = request.cookies.has('has-visited')
  
  // If on root path and first time visitor, redirect to landing
  if (request.nextUrl.pathname === '/' && !hasVisited) {
    const response = NextResponse.redirect(new URL('/landing', request.url))
    // Set cookie to remember they've visited
    response.cookies.set('has-visited', 'true', {
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/',
}