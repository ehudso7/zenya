'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export default function ConfirmPage() {
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get email from sessionStorage
    const pendingEmail = sessionStorage.getItem('pendingEmail')
    if (pendingEmail) {
      setEmail(pendingEmail)
    }
  }, [])

  useEffect(() => {
    // Handle cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return

    setIsResending(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      toast.success('New magic link sent! Check your email.')
      setResendCooldown(60) // 60 second cooldown
    } catch (_error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend email')
    } finally {
      setIsResending(false)
    }
  }

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
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Mail className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold">
                Check Your Email
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                We've sent you a magic link!
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Magic link sent to:
                    </p>
                    <p className="text-sm font-mono text-blue-700 dark:text-blue-300">
                      {email || 'your email'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium">Next steps:</p>
                <ol className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 rounded px-1">1</span>
                    Open your email inbox
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 rounded px-1">2</span>
                    Find the email from Zenya (check spam if needed)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 rounded px-1">3</span>
                    Click the magic link to sign in
                  </li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Didn't receive the email?
                </p>
                <Button
                  onClick={handleResend}
                  disabled={isResending || resendCooldown > 0}
                  variant="secondary"
                  className="w-full"
                  aria-busy={isResending}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      <span className="sr-only">Sending email</span>
                      <span aria-live="polite">Resending...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Magic Link
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Link href="/auth/signin" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                  Try a different email
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Magic links expire after 1 hour for security
          </p>
        </motion.div>
      </div>
    </div>
  )
}