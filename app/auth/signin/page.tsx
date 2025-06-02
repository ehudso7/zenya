'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to password-based sign in
    router.replace('/auth/signin-password')
  }, [router])
  
  return null
}