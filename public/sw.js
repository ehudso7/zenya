// Advanced Service Worker for Zenya AI Learning Platform
// God-Tier offline capability with intelligent caching strategies

const CACHE_NAME = 'zenya-ai-v1'
const DYNAMIC_CACHE = 'zenya-dynamic-v1'
const IMAGE_CACHE = 'zenya-images-v1'
const API_CACHE = 'zenya-api-v1'

// Critical resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/landing',
  '/learn',
  '/auth/signin',
  '/offline',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API endpoints to cache for offline access
const CACHEABLE_APIS = [
  '/api/curriculums',
  '/api/lessons',
  '/api/profile'
]

// Network-first strategies for dynamic content
const NETWORK_FIRST_PATTERNS = [
  /\/api\/ai/,
  /\/api\/metrics/,
  /\/api\/admin/
]

// Cache-first strategies for static content
const CACHE_FIRST_PATTERNS = [
  /\/_next\/static\//,
  /\/icons\//,
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:css|js)$/
]

// Stale-while-revalidate for curriculum content
const SWR_PATTERNS = [
  /\/api\/curriculums/,
  /\/api\/lessons/,
  /\/learn\//
]

// Advanced caching utilities
class CacheManager {
  static async cleanupOldCaches() {
    const cacheNames = await caches.keys()
    const oldCaches = cacheNames.filter(name => 
      name.startsWith('zenya-') && 
      !name.includes('v1')
    )
    
    return Promise.all(
      oldCaches.map(name => caches.delete(name))
    )
  }

  static async limitCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    
    if (keys.length > maxItems) {
      const keysToDelete = keys.slice(0, keys.length - maxItems)
      return Promise.all(
        keysToDelete.map(key => cache.delete(key))
      )
    }
  }

  static async isOnline() {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Background sync for offline actions
class OfflineManager {
  static async queueAction(action) {
    const actions = await this.getQueuedActions()
    actions.push({
      ...action,
      timestamp: Date.now(),
      id: crypto.randomUUID()
    })
    
    await this.saveQueuedActions(actions)
    
    // Try to sync immediately if online
    if (await CacheManager.isOnline()) {
      await this.syncActions()
    }
  }

  static async getQueuedActions() {
    try {
      const cache = await caches.open(API_CACHE)
      const response = await cache.match('/offline-actions')
      return response ? await response.json() : []
    } catch {
      return []
    }
  }

  static async saveQueuedActions(actions) {
    const cache = await caches.open(API_CACHE)
    const response = new Response(JSON.stringify(actions))
    await cache.put('/offline-actions', response)
  }

  static async syncActions() {
    const actions = await this.getQueuedActions()
    const synced = []
    
    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        })
        
        if (response.ok) {
          synced.push(action.id)
        }
      } catch (error) {
        console.warn('Failed to sync action:', action, error)
      }
    }
    
    // Remove synced actions
    const remaining = actions.filter(action => !synced.includes(action.id))
    await this.saveQueuedActions(remaining)
    
    return synced.length
  }
}

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('🚀 Zenya AI Service Worker installing...')
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      
      // Cache critical resources
      await cache.addAll(STATIC_ASSETS)
      
      // Skip waiting to activate immediately
      await self.skipWaiting()
      
      console.log('✅ Critical resources cached')
    })()
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('🔄 Zenya AI Service Worker activating...')
  
  event.waitUntil(
    (async () => {
      // Cleanup old caches
      await CacheManager.cleanupOldCaches()
      
      // Claim all clients immediately
      await self.clients.claim()
      
      console.log('✅ Service Worker activated')
    })()
  )
})

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    // Handle offline POST/PUT/DELETE requests
    if (!navigator.onLine) {
      event.respondWith(handleOfflineRequest(request))
    }
    return
  }
  
  // Apply caching strategy based on URL patterns
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirst(request))
  } else if (SWR_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(staleWhileRevalidate(request))
  } else if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request))
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
  } else {
    event.respondWith(staleWhileRevalidate(request))
  }
})

// Caching strategies implementation
async function cacheFirst(request) {
  const cacheName = getCacheNameForRequest(request)
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      const cacheName = getCacheNameForRequest(request)
      const cache = await caches.open(cacheName)
      await cache.put(request, response.clone())
    }
    
    return response
  } catch {
    const cacheName = getCacheNameForRequest(request)
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)
    
    if (cached) {
      return cached
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline')
    }
    
    return new Response('Offline', { status: 503 })
  }
}

async function staleWhileRevalidate(request) {
  const cacheName = getCacheNameForRequest(request)
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  // Start fetch in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => cached)
  
  // Return cached version immediately if available
  return cached || fetchPromise
}

async function handleOfflineRequest(request) {
  const action = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.text() : null
  }
  
  await OfflineManager.queueAction(action)
  
  return new Response(JSON.stringify({
    success: true,
    message: 'Request queued for sync when online',
    queued: true
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

function getCacheNameForRequest(request) {
  const url = new URL(request.url)
  
  if (url.pathname.startsWith('/api/')) {
    return API_CACHE
  }
  
  if (/\.(png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname)) {
    return IMAGE_CACHE
  }
  
  if (url.pathname.includes('_next/static')) {
    return CACHE_NAME
  }
  
  return DYNAMIC_CACHE
}

// Background sync event
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(OfflineManager.syncActions())
  }
})

// Message event for cache management
self.addEventListener('message', event => {
  const { type, data } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(DYNAMIC_CACHE).then(cache => 
          cache.addAll(data.urls)
        )
      )
      break
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.delete(data.cacheName || DYNAMIC_CACHE)
      )
      break
      
    case 'GET_CACHE_SIZE':
      event.waitUntil(
        (async () => {
          const cache = await caches.open(data.cacheName || DYNAMIC_CACHE)
          const keys = await cache.keys()
          event.ports[0].postMessage({ size: keys.length })
        })()
      )
      break
  }
})

// Periodic cache cleanup
self.addEventListener('periodicsync', event => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(
      (async () => {
        await CacheManager.limitCacheSize(DYNAMIC_CACHE, 50)
        await CacheManager.limitCacheSize(IMAGE_CACHE, 100)
        await CacheManager.limitCacheSize(API_CACHE, 25)
      })()
    )
  }
})

// Push notification support for learning reminders
self.addEventListener('push', event => {
  const options = {
    body: 'Continue your learning journey with Zenya AI',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'learning-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'continue',
        title: 'Continue Learning',
        icon: '/icons/continue-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Later',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  }
  
  if (event.data) {
    const data = event.data.json()
    options.body = data.message || options.body
    options.data = data
  }
  
  event.waitUntil(
    self.registration.showNotification('Zenya AI Learning', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  if (event.action === 'continue') {
    event.waitUntil(
      clients.openWindow('/learn')
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

console.log('🚀 Zenya AI Service Worker loaded - God-Tier offline capability enabled')