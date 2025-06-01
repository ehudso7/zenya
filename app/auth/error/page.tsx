'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const errorMessages: Record<string, { title: string; message: string }> = {
  'invalid-code': {
    title: 'Invalid or Expired Link',
    message: 'This magic link has expired or has already been used. Please request a new one.'
  },
  'server-error': {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again in a few moments.'
  },
  'email-not-confirmed': {
    title: 'Email Not Confirmed',
    message: 'Please check your email and click the confirmation link to continue.'
  },
  'access-denied': {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource.'
  },
  default: {
    title: 'Authentication Error',
    message: 'There was a problem signing you in. Please try again.'
  }
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const errorType = searchParams.get('error') || 'default'
  const error = errorMessages[errorType] || errorMessages.default

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/landing">
          <Button variant="ghost" className="mb-8 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass shadow-premium">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-red-700 dark:text-red-300">
                {error.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-center text-gray-600 dark:text-gray-400">
                {error.message}
              </p>

              <div className="space-y-3">
                <Link href="/auth/signin" className="block">
                  <Button className="w-full btn-primary">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </Link>

                <Link href="/landing" className="block">
                  <Button variant="secondary" className="w-full">
                    Go to Homepage
                  </Button>
                </Link>
              </div>

              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need help?{' '}
                  <Link href="/contact" className="text-blue-600 hover:underline">
                    Contact support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}