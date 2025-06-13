'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { signOut } from '@/lib/supabase/session'

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showIcon?: boolean
  showText?: boolean
  className?: string
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'md',
  showIcon = true,
  showText = true,
  className 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const clearUser = useStore(state => state.clearUser)
  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      // Use the signOut helper which handles everything
      const result = await signOut()
      
      if (result.success) {
        // Reset store
        clearUser()
        
        // Show success message
        toast.success('Signed out successfully')
        
        // Redirect to landing page
        router.push('/landing')
        router.refresh()
      } else {
        throw new Error('Failed to sign out')
      }
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