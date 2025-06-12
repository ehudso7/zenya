/**
 * Custom image loader for CDN
 * Optimizes images through CDN with automatic format conversion and resizing
 */

export default function cdnImageLoader({ src, width, quality }) {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || ''
  
  // If CDN is not configured, fall back to default
  if (!cdnUrl) {
    return src
  }

  // Handle external URLs
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }

  // Construct CDN URL with image optimization parameters
  const params = new URLSearchParams({
    w: width.toString(),
    q: (quality || 75).toString(),
    auto: 'format', // Automatic format selection (WebP, AVIF)
    fit: 'max',     // Maintain aspect ratio
    dpr: '2',       // Support high DPI displays
  })

  // Remove leading slash from src if present
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src

  return `${cdnUrl}/${cleanSrc}?${params.toString()}`
}