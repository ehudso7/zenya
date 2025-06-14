'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DebugDiagnosePage() {
  const [status, setStatus] = useState<string[]>([])
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  const [receivedEvents, setReceivedEvents] = useState<any[]>([])

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const testSSEConnection = () => {
    addStatus('Starting SSE connection test...')
    
    if (eventSource) {
      eventSource.close()
      setEventSource(null)
    }

    const es = new EventSource('/api/debug/connect')
    
    es.onopen = () => {
      addStatus('✅ SSE connection opened')
    }
    
    es.onmessage = (event) => {
      addStatus(`📨 Received message: ${event.data.substring(0, 100)}...`)
      try {
        const data = JSON.parse(event.data)
        setReceivedEvents(prev => [...prev, data])
      } catch (e) {
        addStatus(`❌ Failed to parse message: ${e}`)
      }
    }
    
    es.onerror = (error) => {
      addStatus(`❌ SSE error: ${JSON.stringify(error)}`)
      if (es.readyState === EventSource.CLOSED) {
        addStatus('❌ Connection closed')
      }
    }
    
    setEventSource(es)
  }

  const testDirectPost = async () => {
    addStatus('Testing direct POST to /api/debug/connect...')
    
    try {
      const response = await fetch('/api/debug/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test',
          data: { 
            message: 'Direct test message',
            timestamp: new Date().toISOString()
          }
        })
      })
      
      const result = await response.json()
      addStatus(`✅ POST response: ${JSON.stringify(result)}`)
      
      if (result.activeSessions > 0) {
        addStatus(`✅ Active sessions: ${result.activeSessions}`)
      } else {
        addStatus('⚠️ No active sessions - SSE might not be connected')
      }
    } catch (error) {
      addStatus(`❌ POST error: ${error}`)
    }
  }

  const testDebugLogger = () => {
    addStatus('Testing debug logger...')
    
    // Import and test debug logger
    import('@/lib/debug-logger').then(({ debugLogger }) => {
      addStatus(`Debug enabled: ${localStorage.getItem('DEBUG') === 'true'}`)
      
      // Enable and test
      debugLogger.enable()
      addStatus('✅ Debug logger enabled')
      
      // Send test log
      debugLogger.log('Diagnostic test log', { test: true })
      addStatus('📤 Sent test log via debugLogger')
      
      // Send test error
      debugLogger.error('Diagnostic test error', new Error('Test'))
      addStatus('📤 Sent test error via debugLogger')
    })
  }

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [eventSource])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Debug System Diagnostics</CardTitle>
          <p className="text-sm text-gray-600">Test each component of the debug system</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testSSEConnection} variant="primary">
              Test SSE Connection
            </Button>
            <Button onClick={testDirectPost} variant="secondary">
              Test Direct POST
            </Button>
            <Button onClick={testDebugLogger} variant="secondary">
              Test Debug Logger
            </Button>
            <Button onClick={() => { setStatus([]); setReceivedEvents([]) }} variant="danger">
              Clear
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Status Log</h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 h-96 overflow-y-auto">
                {status.length === 0 ? (
                  <p className="text-gray-500">Click a test button to start...</p>
                ) : (
                  <div className="space-y-1">
                    {status.map((msg, i) => (
                      <div key={i} className="text-xs font-mono">{msg}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Received Events</h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 h-96 overflow-y-auto">
                {receivedEvents.length === 0 ? (
                  <p className="text-gray-500">No events received yet...</p>
                ) : (
                  <div className="space-y-2">
                    {receivedEvents.map((event, i) => (
                      <div key={i} className="text-xs">
                        <Badge variant="secondary">{event.type}</Badge>
                        <pre className="mt-1">{JSON.stringify(event, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
            <h3 className="font-semibold mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Test SSE Connection" first - should show connection opened</li>
              <li>Click "Test Direct POST" - should show active sessions</li>
              <li>If you see events in the right panel, SSE is working</li>
              <li>Click "Test Debug Logger" to test the full flow</li>
              <li>Open /debug/monitor in another tab to see if logs appear there</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}