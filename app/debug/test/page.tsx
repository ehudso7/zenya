'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { debugLogger } from '@/lib/debug-logger'
import { api } from '@/lib/api-client'

export default function DebugTestPage() {
  const [status, setStatus] = useState<string>('Click a button to test')

  const testDebugLog = () => {
    debugLogger.log('Test log message', { timestamp: new Date().toISOString() })
    setStatus('Sent test log - check debug monitor')
  }

  const testError = () => {
    debugLogger.error('Test error message', new Error('This is a test error'))
    setStatus('Sent test error - check debug monitor')
  }

  const testAPICall = async () => {
    try {
      setStatus('Making API call...')
      await api.get('/api/curriculums')
      setStatus('API call successful')
    } catch (error) {
      setStatus(`API call failed: ${error}`)
    }
  }

  const test500Error = async () => {
    try {
      setStatus('Triggering 500 error...')
      await fetch('/api/debug/trigger-error')
      setStatus('500 error triggered')
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const checkDebugStatus = () => {
    const enabled = localStorage.getItem('DEBUG') === 'true'
    setStatus(`Debug is ${enabled ? 'ENABLED' : 'DISABLED'}`)
  }

  const enableDebug = () => {
    debugLogger.enable()
    setStatus('Debug ENABLED')
  }

  const disableDebug = () => {
    debugLogger.disable()
    setStatus('Debug DISABLED')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Debug Logger Test Page</CardTitle>
            <p className="text-sm text-gray-600">Test various debug logging scenarios</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
                <p className="font-mono text-sm">Status: {status}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={checkDebugStatus} variant="secondary">
                  Check Status
                </Button>
                <Button onClick={enableDebug} variant="primary">
                  Enable Debug
                </Button>
                <Button onClick={disableDebug} variant="danger">
                  Disable Debug
                </Button>
                <Button onClick={testDebugLog} variant="secondary">
                  Test Log
                </Button>
                <Button onClick={testError} variant="secondary">
                  Test Error
                </Button>
                <Button onClick={testAPICall} variant="secondary">
                  Test API Call
                </Button>
                <Button onClick={test500Error} variant="danger">
                  Test 500 Error
                </Button>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Open debug monitor in another tab: /debug/monitor</li>
                  <li>Click "Check Status" to see current debug state</li>
                  <li>Click "Enable Debug" if needed</li>
                  <li>Test different scenarios and watch the monitor</li>
                  <li>Check browser console (F12) for detailed logs</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}