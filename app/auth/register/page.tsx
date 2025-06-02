'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to password-based sign in (which includes registration)
    router.replace('/auth/signin-password')
  }, [router])
  
  return null
}