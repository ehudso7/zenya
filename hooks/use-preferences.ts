import { useEffect } from 'react'
import { useStore } from '@/lib/store'

/**
 * Hook that applies user preferences (theme, font size, animations)
 */
export function usePreferences() {
  const { preferences } = useStore()
  
  useEffect(() => {
    // Apply theme
    const root = document.documentElement
    
    if (preferences.theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', isDark)
    } else {
      root.classList.toggle('dark', preferences.theme === 'dark')
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (preferences.theme === 'system') {
        root.classList.toggle('dark', e.matches)
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [preferences.theme])
  
  useEffect(() => {
    // Apply font size
    const root = document.documentElement
    
    switch (preferences.fontSize) {
      case 'small':
        root.style.fontSize = '14px'
        break
      case 'medium':
        root.style.fontSize = '16px'
        break
      case 'large':
        root.style.fontSize = '18px'
        break
    }
  }, [preferences.fontSize])
  
  useEffect(() => {
    // Apply animation preferences
    const root = document.documentElement
    
    if (!preferences.animationsEnabled) {
      root.style.setProperty('--animation-duration', '0ms')
      root.classList.add('reduce-motion')
    } else {
      root.style.removeProperty('--animation-duration')
      root.classList.remove('reduce-motion')
    }
  }, [preferences.animationsEnabled])
  
  return preferences
}

/**
 * Hook to get and update specific preferences
 */
type PreferencesType = {
  soundEnabled: boolean
  animationsEnabled: boolean
  fontSize: 'small' | 'medium' | 'large'
  theme: 'light' | 'dark' | 'system'
}

export function usePreference<K extends keyof PreferencesType>(
  key: K
): [PreferencesType[K], (value: PreferencesType[K]) => void] {
  const preferences = useStore(state => state.preferences)
  const updatePreferences = useStore(state => state.updatePreferences)
  
  const setValue = (value: PreferencesType[K]) => {
    updatePreferences({ [key]: value })
  }
  
  return [preferences[key], setValue]
}