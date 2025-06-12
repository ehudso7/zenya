'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface ServiceWorkerManager {
  registration: ServiceWorkerRegistration | null
  isOnline: boolean
  isUpdateAvailable: boolean
  cacheSize: number
}

export function ServiceWorkerManager() {
  const [sw, setSw] = useState<ServiceWorkerManager>({
    registration: null,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    cacheSize: 0
  })

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }

    // Online/offline detection
    const handleOnline = () => {
      setSw(prev => ({ ...prev, isOnline: true }))
      toast.success('Connection restored! Syncing offline actions...')
      syncOfflineActions()
    }

    const handleOffline = () => {
      setSw(prev => ({ ...prev, isOnline: false }))
      toast.info('You\'re offline. Don\'t worry, your progress is saved!')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      setSw(prev => ({ ...prev, registration }))

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setSw(prev => ({ ...prev, isUpdateAvailable: true }))
              toast.success('New version available! Refresh to update.')
            }
          })
        }
      })

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', event => {
        const { type, data } = event.data
        
        switch (type) {
          case 'CACHE_SIZE_UPDATE':
            setSw(prev => ({ ...prev, cacheSize: data.size }))
            break
            
          case 'SYNC_COMPLETE':
            toast.success(`Synced ${data.count} offline actions`)
            break
            
          case 'CACHE_UPDATED':
            toast.success('Content updated in background')
            break
        }
      })

      console.log('✅ Service Worker registered successfully')
      
      // Get initial cache size
      getCacheSize()
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
    }
  }

  const updateServiceWorker = () => {
    if (sw.registration?.waiting) {
      sw.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  const syncOfflineActions = async () => {
    if (sw.registration?.sync) {
      try {
        await sw.registration.sync.register('background-sync')
      } catch (error) {
        console.warn('Background sync not supported:', error)
      }
    }
  }

  const getCacheSize = () => {
    if (sw.registration?.active) {
      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        setSw(prev => ({ ...prev, cacheSize: event.data.size }))
      }
      
      sw.registration.active.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      )
    }
  }

  const clearCache = async () => {
    if (sw.registration?.active) {
      sw.registration.active.postMessage({ type: 'CLEAR_CACHE' })
      toast.success('Cache cleared successfully')
      getCacheSize()
    }
  }

  const preloadContent = async (urls: string[]) => {
    if (sw.registration?.active) {
      sw.registration.active.postMessage({
        type: 'CACHE_URLS',
        data: { urls }
      })
      toast.success('Content cached for offline use')
    }
  }

  // Expose methods for other components to use
  useEffect(() => {
    (window as any).zenyaSW = {
      preloadContent,
      clearCache,
      getCacheSize,
      isOnline: sw.isOnline,
      cacheSize: sw.cacheSize
    }
  }, [sw])

  return null // This is a utility component with no UI
}

// Hook for other components to use service worker features
export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [cacheSize, setCacheSize] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Get cache size from global SW manager
    const interval = setInterval(() => {
      if ((window as any).zenyaSW) {
        setCacheSize((window as any).zenyaSW.cacheSize)
      }
    }, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const preloadContent = (urls: string[]) => {
    if ((window as any).zenyaSW) {
      (window as any).zenyaSW.preloadContent(urls)
    }
  }

  const clearCache = () => {
    if ((window as any).zenyaSW) {
      (window as any).zenyaSW.clearCache()
    }
  }

  return {
    isOnline,
    cacheSize,
    preloadContent,
    clearCache
  }
}