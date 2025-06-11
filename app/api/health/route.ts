import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface HealthCheck {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  details?: string
  timestamp: string
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  uptime: number
  timestamp: string
  checks: HealthCheck[]
  metrics: {
    memoryUsage: NodeJS.MemoryUsage
    cpuUsage?: number
    activeConnections?: number
  }
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now()
  
  try {
    const supabase = await createServerSupabaseClient()
    
    // Simple connectivity test
    const { error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)
      .single()
    
    const responseTime = Date.now() - start
    
    if (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime,
        details: error.message,
        timestamp: new Date().toISOString()
      }
    }
    
    // Check response time thresholds
    const status = responseTime > 1000 ? 'degraded' : responseTime > 2000 ? 'unhealthy' : 'healthy'
    
    return {
      service: 'database',
      status,
      responseTime,
      details: `Connected successfully. Query time: ${responseTime}ms`,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      details: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString()
    }
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now()
  
  try {
    // Only check if Redis is configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return {
        service: 'redis',
        status: 'degraded',
        responseTime: 0,
        details: 'Redis not configured - rate limiting disabled',
        timestamp: new Date().toISOString()
      }
    }
    
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    
    // Simple ping test
    const result = await redis.ping()
    const responseTime = Date.now() - start
    
    if (result === 'PONG') {
      const status = responseTime > 500 ? 'degraded' : 'healthy'
      return {
        service: 'redis',
        status,
        responseTime,
        details: `Redis responding normally. Ping time: ${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    } else {
      return {
        service: 'redis',
        status: 'unhealthy',
        responseTime,
        details: 'Redis ping failed',
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    return {
      service: 'redis',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      details: error instanceof Error ? error.message : 'Unknown Redis error',
      timestamp: new Date().toISOString()
    }
  }
}

async function checkAIProviders(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []
  
  // Check OpenAI
  if (process.env.OPENAI_API_KEY) {
    const start = Date.now()
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })
      
      const responseTime = Date.now() - start
      const status = response.ok ? (responseTime > 2000 ? 'degraded' : 'healthy') : 'unhealthy'
      
      checks.push({
        service: 'openai',
        status,
        responseTime,
        details: response.ok ? 'OpenAI API accessible' : `HTTP ${response.status}`,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      checks.push({
        service: 'openai',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: error instanceof Error ? error.message : 'OpenAI API error',
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Check Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    const start = Date.now()
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        }),
        signal: AbortSignal.timeout(5000),
      })
      
      const responseTime = Date.now() - start
      const status = response.ok ? (responseTime > 2000 ? 'degraded' : 'healthy') : 'unhealthy'
      
      checks.push({
        service: 'anthropic',
        status,
        responseTime,
        details: response.ok ? 'Anthropic API accessible' : `HTTP ${response.status}`,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      checks.push({
        service: 'anthropic',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: error instanceof Error ? error.message : 'Anthropic API error',
        timestamp: new Date().toISOString()
      })
    }
  }
  
  return checks
}

async function checkEmailService(): Promise<HealthCheck> {
  const start = Date.now()
  
  // Check if email service is configured
  if (!process.env.RESEND_API_KEY && !process.env.SMTP_HOST) {
    return {
      service: 'email',
      status: 'degraded',
      responseTime: 0,
      details: 'No email service configured',
      timestamp: new Date().toISOString()
    }
  }
  
  // Check Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/domains', {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000),
      })
      
      const responseTime = Date.now() - start
      const status = response.ok ? (responseTime > 2000 ? 'degraded' : 'healthy') : 'unhealthy'
      
      return {
        service: 'email',
        status,
        responseTime,
        details: response.ok ? 'Resend API accessible' : `HTTP ${response.status}`,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        service: 'email',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: error instanceof Error ? error.message : 'Resend API error',
        timestamp: new Date().toISOString()
      }
    }
  }
  
  // For SMTP, we can't easily test without sending an email
  return {
    service: 'email',
    status: 'healthy',
    responseTime: 0,
    details: 'SMTP configured (not tested)',
    timestamp: new Date().toISOString()
  }
}

function getSystemMetrics() {
  const memoryUsage = process.memoryUsage()
  
  return {
    memoryUsage,
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  }
}

export async function GET(_request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Run all health checks in parallel
    const [
      databaseCheck,
      redisCheck,
      aiProviderChecks,
      emailCheck,
    ] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkAIProviders(),
      checkEmailService(),
    ])
    
    const allChecks = [
      databaseCheck,
      redisCheck,
      ...aiProviderChecks,
      emailCheck,
    ]
    
    // Determine overall system health
    const hasUnhealthy = allChecks.some(check => check.status === 'unhealthy')
    const hasDegraded = allChecks.some(check => check.status === 'degraded')
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
    if (hasUnhealthy) {
      overallStatus = 'unhealthy'
    } else if (hasDegraded) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'healthy'
    }
    
    const healthReport: SystemHealth = {
      status: overallStatus,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks: allChecks,
      metrics: {
        ...getSystemMetrics(),
        memoryUsage: process.memoryUsage(),
      }
    }
    
    // Return appropriate HTTP status code
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503
    
    return NextResponse.json(healthReport, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
        'X-Health-Check-Duration': `${Date.now() - startTime}ms`,
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error during health check',
      checks: [],
      metrics: {
        memoryUsage: process.memoryUsage(),
      }
    }, { status: 503 })
  }
}

// Simple readiness check for load balancers
export async function HEAD(_request: NextRequest) {
  try {
    // Quick database connectivity check
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from('users').select('count').limit(1).single()
    
    if (error) {
      return new Response(null, { status: 503 })
    }
    
    return new Response(null, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
  } catch {
    return new Response(null, { status: 503 })
  }
}