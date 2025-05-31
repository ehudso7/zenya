'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Bug, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SentryExamplePage() {
  const throwError = () => {
    throw new Error('This is a test error for Sentry!')
  }

  const captureMessage = () => {
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureMessage('Test message from Zenya', 'info')
      alert('Message sent to Sentry!')
    }
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass shadow-premium">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Bug className="w-6 h-6 text-red-500" />
                Sentry Error Tracking Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Testing Environment Only
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This page is for testing Sentry error tracking. Click the buttons below to trigger test errors.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Test Error Handling</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Click this button to throw an error that will be captured by Sentry:
                  </p>
                  <Button
                    variant="danger"
                    onClick={throwError}
                    className="flex items-center gap-2"
                  >
                    <Bug className="w-4 h-4" />
                    Trigger Test Error
                  </Button>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Test Message Capture</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Click this button to send a test message to Sentry:
                  </p>
                  <Button
                    variant="primary"
                    onClick={captureMessage}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Send Test Message
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> After triggering an error, check your Sentry dashboard to see the captured event.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

