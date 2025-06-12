'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { LogOut, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { signOut } from '@/lib/supabase/session'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  showText?: boolean
  className?: string
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default',
  showIcon = true,
  showText = true,
  className 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const resetStore = useStore(state => state.reset)
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      // Clear all sessions and local data
      await signOut()
      
      // Reset store
      resetStore()
      
      // Show success message
      toast.success('Signed out successfully')
      
      // Redirect to landing page
      router.push('/landing')
      router.refresh()
      
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to sign out. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader className="h-4 w-4 animate-spin" />
          {showText && <span className="ml-2">Signing out...</span>}
        </>
      ) : (
        <>
          {showIcon && <LogOut className="h-4 w-4" />}
          {showText && <span className={showIcon ? "ml-2" : ""}>Sign Out</span>}
        </>
      )}
    </Button>
  )
}