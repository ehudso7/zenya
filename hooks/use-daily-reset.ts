import { useEffect } from 'react'
import { useStore } from '@/lib/store'

/**
 * Hook that handles daily XP reset and streak tracking
 */
export function useDailyReset() {
  const { lastActiveDate, updateLastActive, resetDailyXP, user } = useStore()

  useEffect(() => {
    const checkDailyReset = () => {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      
      if (!lastActiveDate) {
        // First time user
        updateLastActive()
        return
      }
      
      const lastActive = new Date(lastActiveDate)
      const lastActiveDay = new Date(
        lastActive.getFullYear(), 
        lastActive.getMonth(), 
        lastActive.getDate()
      ).toISOString()
      
      // If it's a new day, reset daily XP
      if (today !== lastActiveDay) {
        resetDailyXP()
        updateLastActive()
        
        // Check if streak should be broken
        const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff > 1 && user?.learning_streak && user.learning_streak > 0) {
          // Streak broken - this would need an API call to update
          console.log('Streak broken - update needed')
        }
      }
    }
    
    // Check on mount
    checkDailyReset()
    
    // Check every minute
    const interval = setInterval(checkDailyReset, 60 * 1000)
    
    return () => clearInterval(interval)
  }, [lastActiveDate, updateLastActive, resetDailyXP, user?.learning_streak])
}