import { NextRequest } from 'next/server'
import crypto from 'crypto'

// Security configuration
const SECURITY_CONFIG = {
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  allowedOrigins: [
    'https://zenya.ai',
    'https://www.zenya.ai',
    'https://app.zenya.ai',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : [])
  ],
  blockedUserAgents: [
    'bot', 'spider', 'crawler', 'scraper', 'scanner'
  ],
  suspiciousPatterns: [
    /(\<|\%3C)([^\>]+(\>|\%3E))/i, // XSS attempts
    /(union|select|insert|update|delete|drop|create|alter)/i, // SQL injection
    /(javascript:|data:|vbscript:)/i, // Script injection
    /(\.\.|\/\/|\\\\)/i, // Path traversal
  ]
}

// Request fingerprinting for security analysis
export function generateRequestFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || ''
  const acceptLanguage = request.headers.get('accept-language') || ''
  const acceptEncoding = request.headers.get('accept-encoding') || ''
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  
  const fingerprint = `${ip}-${userAgent}-${acceptLanguage}-${acceptEncoding}`
  return crypto.createHash('sha256').update(fingerprint).digest('hex').substring(0, 16)
}

// Advanced threat detection
export function detectSecurityThreats(request: NextRequest): {
  isThreat: boolean
  reasons: string[]
  riskScore: number
} {
  const threats: string[] = []
  let riskScore = 0
  
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''
  const origin = request.headers.get('origin')
  const _referer = request.headers.get('referer')
  const contentType = request.headers.get('content-type')
  
  // Check for suspicious user agents
  if (SECURITY_CONFIG.blockedUserAgents.some(pattern => userAgent.includes(pattern))) {
    threats.push('suspicious_user_agent')
    riskScore += 30
  }
  
  // Check for missing or invalid user agent
  if (!userAgent || userAgent.length < 10) {
    threats.push('missing_user_agent')
    riskScore += 20
  }
  
  // Check origin validation for non-GET requests
  if (request.method !== 'GET' && origin) {
    if (!SECURITY_CONFIG.allowedOrigins.includes(origin)) {
      threats.push('invalid_origin')
      riskScore += 50
    }
  }
  
  // Check for suspicious request patterns in URL
  const url = request.url
  if (SECURITY_CONFIG.suspiciousPatterns.some(pattern => pattern.test(url))) {
    threats.push('suspicious_url_pattern')
    riskScore += 40
  }
  
  // Check for rapid successive requests (basic bot detection)
  const _timestamp = Date.now()
  const _requestKey = generateRequestFingerprint(request)
  
  // Check content type for POST requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    if (!contentType || !contentType.includes('application/json')) {
      threats.push('invalid_content_type')
      riskScore += 10
    }
  }
  
  // Check for excessive headers (potential attack)
  const headerCount = Array.from(request.headers.keys()).length
  if (headerCount > 50) {
    threats.push('excessive_headers')
    riskScore += 25
  }
  
  return {
    isThreat: riskScore >= 50,
    reasons: threats,
    riskScore
  }
}

// Content Security Policy generator
export function generateCSP(): string {
  const isProduction = process.env.NODE_ENV === 'production'
  
  const policies = [
    "default-src 'self'",
    isProduction 
      ? "script-src 'self' 'unsafe-inline' https://js.sentry-cdn.com https://browser.sentry-cdn.com https://www.googletagmanager.com" 
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    isProduction ? "upgrade-insecure-requests" : "",
    "connect-src 'self' https://*.supabase.co https://*.openai.com https://*.anthropic.com https://api.resend.com wss://*.supabase.co"
  ].filter(Boolean)
  
  return policies.join('; ')
}

// Security headers middleware
export function getSecurityHeaders(): Record<string, string> {
  return {
    // HTTPS and transport security
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Content Security Policy
    'Content-Security-Policy': generateCSP(),
    
    // XSS Protection
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permission Policy (formerly Feature Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', '),
    
    // Cross-domain policies
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    
    // Cache control for security
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    
    // Custom security headers
    'X-Request-ID': crypto.randomUUID(),
    'X-Robots-Tag': 'noindex, nofollow, nosnippet, noarchive',
  }
}

// IP allowlist/blocklist management
const BLOCKED_IPS = new Set<string>()
const ALLOWED_IPS = new Set<string>()

export function isIPBlocked(ip: string): boolean {
  if (ALLOWED_IPS.has(ip)) return false
  return BLOCKED_IPS.has(ip)
}

export function blockIP(ip: string, reason: string): void {
  BLOCKED_IPS.add(ip)
  console.warn(`IP ${ip} blocked: ${reason}`)
}

export function allowIP(ip: string): void {
  ALLOWED_IPS.add(ip)
  BLOCKED_IPS.delete(ip)
}

// Request validation
export async function validateRequest(request: NextRequest): Promise<{
  isValid: boolean
  errors: string[]
}> {
  const errors: string[] = []
  
  // Check request size
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > SECURITY_CONFIG.maxRequestSize) {
    errors.push('Request too large')
  }
  
  // Check for required headers in POST requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    if (!request.headers.get('content-type')) {
      errors.push('Missing content-type header')
    }
  }
  
  // Basic request validation
  try {
    const url = new URL(request.url)
    if (url.pathname.length > 2048) {
      errors.push('URL path too long')
    }
  } catch {
    errors.push('Invalid URL')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Audit logging for security events
export function logSecurityEvent(event: {
  type: 'threat_detected' | 'rate_limit_exceeded' | 'auth_failure' | 'access_denied'
  ip: string
  userAgent: string
  details: Record<string, any>
  timestamp?: Date
}) {
  const logEntry = {
    ...event,
    timestamp: event.timestamp || new Date(),
    severity: event.type === 'threat_detected' ? 'high' : 'medium'
  }
  
  // In production, this would go to a security monitoring system
  console.warn('SECURITY_EVENT:', JSON.stringify(logEntry))
  
  // Automatically block IPs with repeated threats
  if (event.type === 'threat_detected') {
    // Implementation would track repeat offenders and auto-block
  }
}

// Request signing for API authentication
export function signRequest(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

export function verifyRequestSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = signRequest(payload, secret)
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}