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

export default function SignInPasswordPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false)
  const [lastSignupEmail, setLastSignupEmail] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Sign in response:', { data, error })

      if (error) {
        console.error('Sign in error:', error)
        throw error
      }

      if (data.user) {
        console.log('Sign in successful, user ID:', data.user.id)
        toast.success('Signed in successfully!')
        
        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single()

        console.log('Profile check:', { profile, profileError })

        if (profile?.onboarding_completed) {
          console.log('Redirecting to /learn')
          router.push('/learn')
        } else {
          console.log('Redirecting to /profile')
          router.push('/profile')
        }
      }
    } catch (error: any) {
      console.error('Full sign in error:', error)
      toast.error(error.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      console.log('Starting signup process for:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      console.log('Signup response:', { data, error })

      if (error) {
        console.error('Signup error:', error)
        throw error
      }

      if (data.user) {
        console.log('User created successfully:', data.user.id)
        
        // Check if the user email is confirmed (if email confirmation is disabled, this will be true)
        if (data.user.email_confirmed_at) {
          console.log('Email already confirmed, attempting sign in...')
          toast.success('Account created! Signing you in...')
          
          // Wait a bit before signing in to ensure the user is created
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Sign in immediately after signup
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          console.log('Sign in response:', { signInData, signInError })

          if (!signInError && signInData.user) {
            console.log('Sign in successful, redirecting to profile...')
            // Force a router refresh to ensure auth state is updated
            router.refresh()
            router.push('/profile')
          } else if (signInError) {
            console.error('Sign in error after signup:', signInError)
            toast.error('Account created but failed to sign in. Please try signing in manually.')
          }
        } else {
          // Email confirmation is required
          console.log('Email confirmation required')
          setEmailConfirmationRequired(true)
          setLastSignupEmail(email)
          toast.success('Account created! Please check your email to confirm your account before signing in.', {
            duration: 6000,
          })
          // Reset form but keep email for resend functionality
          setPassword('')
        }
      } else {
        console.log('No user data returned from signup')
        toast.error('Failed to create account. Please try again.')
      }
    } catch (error: any) {
      console.error('Full error object:', error)
      toast.error(error.message || 'Failed to create account')
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
      console.log('Resending confirmation email to:', lastSignupEmail)
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: lastSignupEmail,
      })
      
      if (error) {
        console.error('Resend error:', error)
        throw error
      }
      
      toast.success('Confirmation email resent! Please check your inbox and spam folder.', {
        duration: 5000,
      })
    } catch (error: any) {
      console.error('Failed to resend email:', error)
      
      // Check for rate limit error
      if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
        toast.error('Email rate limit reached. Please wait an hour before trying again.', {
          duration: 6000,
        })
      } else {
        toast.error(error.message || 'Failed to resend email. Please try again later.')
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
          <Button variant="ghost" className="mb-8 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <Card className="glass">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
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
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Check your email!</p>
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
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-premium"
                disabled={isLoading}
              >
                {isLoading && !isSignUp ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
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
              >
                {isLoading && isSignUp ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create New Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/demo" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Try demo account
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}