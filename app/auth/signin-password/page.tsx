'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader, ArrowLeft, LogIn, UserPlus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function SignInPasswordPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false)
  const [lastSignupEmail, setLastSignupEmail] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    const newErrors: typeof errors = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Announce errors to screen readers
      const errorMessage = Object.values(newErrors).join('. ')
      toast.error(errorMessage)
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        toast.success('Signed in successfully!')
        
        // Check if user profile exists
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single()

        if (profile?.onboarding_completed) {
          router.push('/learn')
        } else {
          router.push('/profile')
        }
      }
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password'
      setErrors({ form: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    setErrors({})
    
    const newErrors: typeof errors = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const errorMessage = Object.values(newErrors).join('. ')
      toast.error(errorMessage)
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Check if the user email is confirmed (if email confirmation is disabled, this will be true)
        if (data.user.email_confirmed_at) {
          toast.success('Account created! Signing you in...')
          
          // Wait a bit before signing in to ensure the user is created
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Sign in immediately after signup
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (!signInError && signInData.user) {
            // Force a router refresh to ensure auth state is updated
            router.refresh()
            router.push('/profile')
          } else if (signInError) {
            toast.error('Account created but failed to sign in. Please try signing in manually.')
          }
        } else {
          // Email confirmation is required
          setEmailConfirmationRequired(true)
          setLastSignupEmail(email)
          toast.success('Account created! Please check your email to confirm your account before signing in.', {
            duration: 6000,
          })
          // Reset form but keep email for resend functionality
          setPassword('')
        }
      } else {
        toast.error('Failed to create account. Please try again.')
      }
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account'
      setErrors({ form: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
      setIsSignUp(false)
    }
  }

  const resendConfirmationEmail = async () => {
    if (!lastSignupEmail) {
      toast.error('Please create an account first')
      return
    }

    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: lastSignupEmail,
      })
      
      if (error) {
        throw error
      }
      
      toast.success('Confirmation email resent! Please check your inbox and spam folder.', {
        duration: 5000,
      })
    } catch (_error) {
      
      // Check for rate limit error
      if (error instanceof Error && (error.message?.includes('rate limit') || error.message?.includes('too many'))) {
        toast.error('Email rate limit reached. Please wait an hour before trying again.', {
          duration: 6000,
        })
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to resend email. Please try again later.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/landing">
          <Button variant="ghost" className="mb-8 flex items-center gap-2" aria-label="Go back to home page">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Home
          </Button>
        </Link>

        <Card className="glass">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center" id="signin-title">Welcome back</CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Sign in to continue your learning journey
            </p>
          </CardHeader>
          <CardContent>
            {emailConfirmationRequired && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <h2 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Check your email!</h2>
                    <p className="text-blue-700 dark:text-blue-300 mt-1 text-sm">
                      We've sent a confirmation link to <strong>{lastSignupEmail}</strong>. Please click it to activate your account.
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 mt-2 text-xs">
                      Also check your spam/junk folder. Email may take a few minutes to arrive.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resendConfirmationEmail}
                      disabled={isLoading}
                      className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="mr-2 h-3 w-3 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Resend confirmation email'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            
            <form onSubmit={handleSignIn} className="space-y-4" aria-labelledby="signin-title" noValidate>
              {errors.form && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert" aria-live="assertive">
                  <p className="text-sm text-red-700 dark:text-red-300">{errors.form}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({ ...errors, email: undefined })
                    }}
                    className={cn("pl-10", errors.email && "border-red-500")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors({ ...errors, password: undefined })
                    }}
                    className={cn("pl-10", errors.password && "border-red-500")}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : "password-hint"}
                    autoComplete="current-password"
                  />
                </div>
                {errors.password ? (
                  <p id="password-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.password}
                  </p>
                ) : (
                  <p id="password-hint" className="text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full btn-premium"
                disabled={isLoading}
                aria-busy={isLoading && !isSignUp}
              >
                {isLoading && !isSignUp ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    <span aria-live="polite">Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                    Sign In
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setIsSignUp(true)
                  handleSignUp()
                }}
                disabled={isLoading}
                aria-busy={isLoading && isSignUp}
              >
                {isLoading && isSignUp ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    <span aria-live="polite">Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Create New Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/demo" className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                Try demo account
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}