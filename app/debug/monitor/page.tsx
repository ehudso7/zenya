'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Download, Pause, Play, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DebugLog {
  id: string
  type: string
  data: any
  timestamp: string
  sessionId?: string
}

export default function DebugMonitor() {
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [sessionId, setSessionId] = useState<string>('')
  const eventSourceRef = useRef<EventSource | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isPausedRef = useRef(isPaused)

  // Keep isPausedRef in sync
  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    const connectToStream = () => {
      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      // Use the new broadcast endpoint for better real-time connection
      const eventSource = new EventSource('/api/debug/connect')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
        // eslint-disable-next-line no-console
        console.log('[Debug Monitor] Connected to debug broadcast')
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'connected') {
            setSessionId(data.sessionId)
            // eslint-disable-next-line no-console
            console.log('[Debug Monitor] Session established:', data.sessionId)
          } else if (data.type === 'heartbeat') {
            // Keep-alive signal, ignore
          } else if (!isPausedRef.current && data.type && data.data) {
            const log: DebugLog = {
              id: crypto.randomUUID(),
              type: data.type,
              data: data.data,
              timestamp: data.timestamp || new Date().toISOString(),
              sessionId: data.sessionId
            }
            
            setLogs(prev => {
              const newLogs = [...prev, log]
              // Keep only last 1000 logs to prevent memory issues
              return newLogs.length > 1000 ? newLogs.slice(-1000) : newLogs
            })
          }
        } catch {
          // Silently ignore parse errors
        }
      }

      eventSource.onerror = (error) => {
        console.error('[Debug Monitor] Connection error:', error)
        setIsConnected(false)
        eventSourceRef.current?.close()
        eventSourceRef.current = null
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connectToStream, 3000)
      }
    }

    connectToStream()

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, []) // Empty dependency array - only connect once

  useEffect(() => {
    if (!isPaused && logs.length > 0) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs.length, isPaused])

  const clearLogs = useCallback(() => setLogs([]), [])
  
  const downloadLogs = useCallback(() => {
    const data = JSON.stringify(logs, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [logs])

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter)

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 dark:text-red-400'
      case 'api': return 'text-blue-600 dark:text-blue-400'
      case 'user': return 'text-green-600 dark:text-green-400'
      case 'performance': return 'text-yellow-600 dark:text-yellow-400'
      case 'state': return 'text-purple-600 dark:text-purple-400'
      case 'voice': return 'text-orange-600 dark:text-orange-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Debug Monitor</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Session: {sessionId || 'Connecting...'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "secondary" : "destructive"}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={downloadLogs}
                  disabled={logs.length === 0}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={clearLogs}
                  disabled={logs.length === 0}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="flex gap-2">
                {['all', 'log', 'error', 'api', 'user', 'performance', 'state', 'voice'].map(type => (
                  <Button
                    key={type}
                    size="sm"
                    variant={filter === type ? 'primary' : 'ghost'}
                    onClick={() => setFilter(type)}
                    className="text-xs"
                  >
                    {type}
                    {type !== 'all' && (
                      <span className="ml-1 text-xs opacity-60">
                        ({logs.filter(l => l.type === type).length})
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-[calc(100vh-250px)] overflow-hidden">
          <CardContent className="p-0 h-full">
            <div className="h-full overflow-y-auto font-mono text-sm">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {isPaused ? 'Logging paused' : 'No logs yet...'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLogs.map(log => (
                    <div key={log.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", getLogColor(log.type))}
                        >
                          {log.type}
                        </Badge>
                        <div className="flex-1 overflow-hidden">
                          <pre className="text-xs whitespace-pre-wrap break-all">
                            {(() => {
                              try {
                                return JSON.stringify(log.data, null, 2)
                              } catch (e) {
                                return `[Error stringifying data: ${e}]`
                              }
                            })()}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}