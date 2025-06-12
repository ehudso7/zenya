import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/api-middleware'
import { circuitBreakerRegistry } from '@/lib/ai/circuit-breaker'

interface MetricsBatch {
  metrics: Array<{
    name: string
    value: number
    unit: string
    timestamp: number
    userId?: string
    sessionId?: string
    route?: string
    metadata?: Record<string, any>
  }>
}

// Store metrics in memory for real-time dashboard (in production, use Redis)
const metricsBuffer: Map<string, any[]> = new Map()
const maxBufferSize = 1000

function addToBuffer(key: string, metric: any) {
  if (!metricsBuffer.has(key)) {
    metricsBuffer.set(key, [])
  }
  
  const buffer = metricsBuffer.get(key)!
  buffer.push({
    ...metric,
    timestamp: Date.now()
  })
  
  // Keep buffer size manageable
  if (buffer.length > maxBufferSize) {
    buffer.splice(0, buffer.length - maxBufferSize)
  }
}

// POST endpoint for receiving metrics from client
export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      const body: MetricsBatch = await req.json()
      
      if (!body.metrics || !Array.isArray(body.metrics)) {
        return NextResponse.json(
          { error: 'Invalid metrics format' },
          { status: 400 }
        )
      }
      
      // Process each metric
      body.metrics.forEach(metric => {
        const enhancedMetric = {
          ...metric,
          userId: user?.id || metric.userId,
          receivedAt: Date.now(),
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
        
        // Store in memory buffer for real-time access
        addToBuffer(metric.name, enhancedMetric)
        addToBuffer('all_metrics', enhancedMetric)
        
        // Store in database for persistence (in production)
        // In development, we'll skip database storage to avoid schema requirements
        if (process.env.NODE_ENV === 'production') {
          supabase
            .from('performance_metrics')
            .insert(enhancedMetric)
            .then()
            .then(
              () => {},
              error => console.warn('Failed to store metric in DB:', error.message)
            )
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        processed: body.metrics.length,
        timestamp: Date.now()
      })
      
    } catch (error) {
      console.error('Metrics processing error:', error)
      return NextResponse.json(
        { error: 'Failed to process metrics' },
        { status: 500 }
      )
    }
  }, 'api')
}

// GET endpoint for retrieving metrics (for admin dashboard)
export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      // Check if user is admin (same logic as admin dashboard)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const { data: profile } = await supabase
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single()
      
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
      const isAdmin = adminEmails.includes(profile?.email || '')
      
      if (!isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
      
      const url = new URL(request.url)
      const metricName = url.searchParams.get('metric')
      const timeRange = parseInt(url.searchParams.get('timeRange') || '3600000') // 1 hour default
      const limit = parseInt(url.searchParams.get('limit') || '100')
      
      const cutoffTime = Date.now() - timeRange
      
      let metrics: any[] = []
      
      if (metricName) {
        // Get specific metric
        metrics = (metricsBuffer.get(metricName) || [])
          .filter(m => m.timestamp >= cutoffTime)
          .slice(-limit)
      } else {
        // Get all metrics with summary
        const summary: Record<string, any> = {}
        
        metricsBuffer.forEach((values, key) => {
          if (key === 'all_metrics') return
          
          const recentValues = values
            .filter(m => m.timestamp >= cutoffTime)
            .slice(-limit)
          
          if (recentValues.length > 0) {
            const numericValues = recentValues
              .map(v => v.value)
              .filter(v => typeof v === 'number')
            
            if (numericValues.length > 0) {
              summary[key] = {
                count: recentValues.length,
                latest: recentValues[recentValues.length - 1],
                average: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
                min: Math.min(...numericValues),
                max: Math.max(...numericValues),
                recent: recentValues.slice(-10) // Last 10 values
              }
            } else {
              summary[key] = {
                count: recentValues.length,
                latest: recentValues[recentValues.length - 1],
                recent: recentValues.slice(-10)
              }
            }
          }
        })
        
        // Add circuit breaker health
        summary.circuit_breakers = circuitBreakerRegistry.getHealthReport()
        
        // Add system info
        summary.system = {
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
          timestamp: Date.now(),
          bufferSizes: Array.from(metricsBuffer.entries()).map(([key, values]) => ({
            metric: key,
            count: values.length
          }))
        }
        
        return NextResponse.json(summary)
      }
      
      return NextResponse.json({
        metric: metricName,
        data: metrics,
        count: metrics.length,
        timeRange,
        timestamp: Date.now()
      })
      
    } catch (error) {
      console.error('Metrics retrieval error:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve metrics' },
        { status: 500 }
      )
    }
  }, 'api')
}

// DELETE endpoint for clearing metrics (admin only)
export async function DELETE(request: NextRequest) {
  return withRateLimit(request, async () => {
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const { data: profile } = await supabase
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single()
      
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
      const isAdmin = adminEmails.includes(profile?.email || '')
      
      if (!isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
      
      // Clear all metrics buffers
      metricsBuffer.clear()
      
      return NextResponse.json({ 
        success: true, 
        message: 'All metrics cleared',
        timestamp: Date.now()
      })
      
    } catch (error) {
      console.error('Metrics clearing error:', error)
      return NextResponse.json(
        { error: 'Failed to clear metrics' },
        { status: 500 }
      )
    }
  }, 'api')
}