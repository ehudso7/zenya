'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Users, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Zap,
  Shield,
  Database,
  Server
} from 'lucide-react'

interface DashboardMetrics {
  users: {
    total: number
    active30Days: number
    newToday: number
    retentionRate: number
  }
  learning: {
    totalLessons: number
    lessonsCompletedToday: number
    avgCompletionRate: number
    popularCurriculums: Array<{
      title: string
      enrollments: number
      completionRate: number
    }>
  }
  engagement: {
    avgSessionTime: number
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
  }
  ai: {
    totalRequests: number
    requestsToday: number
    avgResponseTime: number
    providerHealth: Record<string, any>
    errorRate: number
  }
  system: {
    uptime: number
    memoryUsage: NodeJS.MemoryUsage
    healthChecks: any[]
    alertsCount: number
  }
  revenue: {
    totalUsers: number
    premiumUsers: number
    conversionRate: number
    mrr: number
  }
}

interface PerformanceMetrics {
  [key: string]: {
    count: number
    average: number
    min: number
    max: number
    recent: any[]
  }
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fetchMetrics = async () => {
    try {
      const [dashboardResponse, metricsResponse] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/metrics')
      ])

      if (!dashboardResponse.ok) {
        throw new Error(`Dashboard API error: ${dashboardResponse.status}`)
      }

      const dashboardData = await dashboardResponse.json()
      setMetrics(dashboardData)

      if (metricsResponse.ok) {
        const performanceData = await metricsResponse.json()
        setPerformanceMetrics(performanceData)
      }

      setError(null)
    } catch (err) {
      console.error('Failed to fetch metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminAction = async (action: string, target?: string) => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target })
      })

      if (!response.ok) {
        throw new Error('Admin action failed')
      }

      const result = await response.json()
      console.warn('Admin action result:', result)
      
      // Refresh metrics after action
      fetchMetrics()
    } catch (err) {
      console.error('Admin action failed:', err)
      setError(err instanceof Error ? err.message : 'Admin action failed')
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/auth/signin')
          return
        }

        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile || profile.role !== 'admin') {
          setError('You do not have permission to access this page')
          setTimeout(() => router.push('/learn'), 2000)
          return
        }

        setIsAdmin(true)
        fetchMetrics()

        // Set up auto-refresh every 30 seconds
        const interval = setInterval(fetchMetrics, 30000)

        return () => {
          if (interval) clearInterval(interval)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        setError('Authentication error')
        setTimeout(() => router.push('/auth/signin'), 2000)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="animate-spin mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold">Loading Admin Dashboard...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchMetrics}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!metrics || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-semibold">No Data Available</h2>
        </div>
      </div>
    )
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zenya AI Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time system monitoring and analytics</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={fetchMetrics} variant="secondary">
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => handleAdminAction('refresh_analytics')} variant="secondary">
                <Database className="w-4 h-4 mr-2" />
                Refresh Analytics
              </Button>
              <Button onClick={() => handleAdminAction('clear_cache')} variant="secondary">
                <Zap className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">System Status</h3>
                <p className="text-2xl font-semibold text-green-600">
                  {metrics.system.alertsCount === 0 ? 'Healthy' : 'Issues'}
                </p>
                <p className="text-xs text-gray-400">
                  {metrics.system.healthChecks.length} checks
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Uptime</h3>
                <p className="text-2xl font-semibold text-blue-600">
                  {formatUptime(metrics.system.uptime)}
                </p>
                <p className="text-xs text-gray-400">System running</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Server className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Memory Usage</h3>
                <p className="text-2xl font-semibold text-purple-600">
                  {formatBytes(metrics.system.memoryUsage.rss)}
                </p>
                <p className="text-xs text-gray-400">
                  Heap: {formatBytes(metrics.system.memoryUsage.heapUsed)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">AI Health</h3>
                <p className="text-2xl font-semibold text-orange-600">
                  {Object.values(metrics.ai.providerHealth).filter((p: any) => p.isHealthy).length} / {Object.keys(metrics.ai.providerHealth).length}
                </p>
                <p className="text-xs text-gray-400">Providers healthy</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Users */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Users</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold">{metrics.users.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active (30d)</span>
                <span className="font-semibold">{metrics.users.active30Days.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Today</span>
                <span className="font-semibold">{metrics.users.newToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Retention Rate</span>
                <span className="font-semibold">{metrics.users.retentionRate}%</span>
              </div>
            </div>
          </Card>

          {/* Learning */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Brain className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold">Learning</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Lessons</span>
                <span className="font-semibold">{metrics.learning.totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Today</span>
                <span className="font-semibold">{metrics.learning.lessonsCompletedToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Completion</span>
                <span className="font-semibold">{metrics.learning.avgCompletionRate}%</span>
              </div>
            </div>
          </Card>

          {/* Engagement */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold">Engagement</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Session</span>
                <span className="font-semibold">{metrics.engagement.avgSessionTime.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Active</span>
                <span className="font-semibold">{metrics.engagement.dailyActiveUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weekly Active</span>
                <span className="font-semibold">{metrics.engagement.weeklyActiveUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Active</span>
                <span className="font-semibold">{metrics.engagement.monthlyActiveUsers}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Provider Health */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Brain className="w-5 h-5 text-blue-600 mr-2" />
            AI Provider Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(metrics.ai.providerHealth).map(([provider, health]: [string, any]) => (
              <div key={provider} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{provider}</span>
                  <div className={`w-3 h-3 rounded-full ${health.isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>State: <span className="font-medium">{health.state}</span></div>
                  <div>Health: <span className="font-medium">{(health.healthScore * 100).toFixed(1)}%</span></div>
                  <div>Requests: <span className="font-medium">{health.requestCount}</span></div>
                  {health.failures > 0 && (
                    <div className="text-red-600">Failures: <span className="font-medium">{health.failures}</span></div>
                  )}
                </div>
                {!health.isHealthy && (
                  <Button 
                    size="sm" 
                    className="mt-2 w-full" 
                    onClick={() => handleAdminAction('reset_circuit_breaker', provider)}
                  >
                    Reset Circuit Breaker
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Popular Curriculums */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Popular Curriculums</h3>
          <div className="space-y-3">
            {metrics.learning.popularCurriculums.map((curriculum, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{curriculum.title}</span>
                  <div className="text-sm text-gray-600">
                    {curriculum.enrollments} enrollments • {curriculum.completionRate}% completion
                  </div>
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${curriculum.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics */}
        {performanceMetrics && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 text-yellow-600 mr-2" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(performanceMetrics)
                .filter(([key]) => !['circuit_breakers', 'system'].includes(key))
                .slice(0, 9)
                .map(([metric, data]: [string, any]) => (
                <div key={metric} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 capitalize">{metric.replace(/_/g, ' ')}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Count: <span className="font-medium">{data.count}</span></div>
                    {typeof data.average === 'number' && (
                      <>
                        <div>Average: <span className="font-medium">{data.average.toFixed(2)}{data.latest?.unit || ''}</span></div>
                        <div>Min: <span className="font-medium">{data.min.toFixed(2)}</span></div>
                        <div>Max: <span className="font-medium">{data.max.toFixed(2)}</span></div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Revenue */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold">Revenue</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.revenue.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.revenue.premiumUsers}</div>
              <div className="text-sm text-gray-600">Premium Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.revenue.conversionRate}%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${metrics.revenue.mrr}</div>
              <div className="text-sm text-gray-600">MRR</div>
            </div>
          </div>
        </Card>

        {/* Auto-refresh indicator */}
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 border">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
            Auto-refreshing every 30s
          </div>
        </div>
      </div>
    </div>
  )
}