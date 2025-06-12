'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to password-based sign up with registration mode
    router.replace('/auth/signin-password?mode=register')
  }, [router])
  
  return null
}