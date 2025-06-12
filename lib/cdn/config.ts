/**
 * CDN Configuration and Utilities
 * Handles static asset optimization and delivery through CDN
 */

export interface CDNConfig {
  url: string
  enabled: boolean
  regions: string[]
  cacheControl: {
    static: string
    images: string
    fonts: string
    scripts: string
  }
}

export const cdnConfig: CDNConfig = {
  url: process.env.NEXT_PUBLIC_CDN_URL || '',
  enabled: !!process.env.NEXT_PUBLIC_CDN_URL,
  regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  cacheControl: {
    static: 'public, max-age=31536000, immutable', // 1 year
    images: 'public, max-age=31536000, immutable', // 1 year
    fonts: 'public, max-age=31536000, immutable',  // 1 year
    scripts: 'public, max-age=86400, must-revalidate', // 24 hours
  },
}

/**
 * Get CDN URL for an asset
 */
export function getCDNUrl(path: string): string {
  if (!cdnConfig.enabled) {
    return path
  }

  // Handle external URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  return `${cdnConfig.url}${cleanPath}`
}

/**
 * Get optimized image URL through CDN
 */
export function getCDNImageUrl(
  src: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'
  } = {}
): string {
  if (!cdnConfig.enabled) {
    return src
  }

  const params = new URLSearchParams()
  
  if (options.width) params.set('w', options.width.toString())
  if (options.height) params.set('h', options.height.toString())
  if (options.quality) params.set('q', options.quality.toString())
  if (options.format) params.set('f', options.format)
  
  // Default optimizations
  params.set('auto', 'compress')
  params.set('fit', 'max')
  
  const baseUrl = getCDNUrl(src)
  return `${baseUrl}?${params.toString()}`
}

/**
 * Preload critical assets through CDN
 */
export function preloadCDNAssets(assets: string[]): void {
  if (!cdnConfig.enabled || typeof window === 'undefined') {
    return
  }

  assets.forEach(asset => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = getCDNUrl(asset)
    
    // Determine asset type
    if (asset.endsWith('.css')) {
      link.as = 'style'
    } else if (asset.endsWith('.js')) {
      link.as = 'script'
    } else if (asset.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
      link.as = 'image'
    } else if (asset.match(/\.(woff|woff2|ttf|otf)$/)) {
      link.as = 'font'
      link.crossOrigin = 'anonymous'
    }
    
    document.head.appendChild(link)
  })
}

/**
 * Generate integrity hash for CDN assets
 */
export async function generateIntegrity(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-384', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashBase64 = btoa(String.fromCharCode(...hashArray))
    return `sha384-${hashBase64}`
  } catch (error) {
    console.error('Failed to generate integrity hash:', error)
    return ''
  }
}

/**
 * CDN resource hints for better performance
 */
export function addCDNResourceHints(): void {
  if (!cdnConfig.enabled || typeof window === 'undefined') {
    return
  }

  const cdnDomain = new URL(cdnConfig.url).hostname

  // DNS prefetch
  const dnsPrefetch = document.createElement('link')
  dnsPrefetch.rel = 'dns-prefetch'
  dnsPrefetch.href = `//${cdnDomain}`
  document.head.appendChild(dnsPrefetch)

  // Preconnect
  const preconnect = document.createElement('link')
  preconnect.rel = 'preconnect'
  preconnect.href = cdnConfig.url
  preconnect.crossOrigin = 'anonymous'
  document.head.appendChild(preconnect)
}