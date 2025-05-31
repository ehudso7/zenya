import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/learn/', '/profile/'],
    },
    sitemap: 'https://zenya.app/sitemap.xml',
  }
}