'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestStreamPage() {
  const [status, setStatus] = useState('')

  const sendDirectLog = async (type: string, message: string) => {
    try {
      const response = await fetch('/api/debug/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data: { message, timestamp: new Date().toISOString() },
          sessionId: 'test-' + Date.now()
        })
      })
      const result = await response.json()
      setStatus(`Sent ${type} log - Active sessions: ${result.activeSessions}`)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Direct Debug Stream Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            Status: {status || 'Ready'}
          </div>
          <div className="space-x-2">
            <Button onClick={() => sendDirectLog('log', 'Test log message')}>
              Send Log
            </Button>
            <Button onClick={() => sendDirectLog('error', 'Test error message')}>
              Send Error
            </Button>
            <Button onClick={() => sendDirectLog('api', 'Test API message')}>
              Send API
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}