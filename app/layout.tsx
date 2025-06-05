import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from '@/components/providers'
import Script from 'next/script'
import CookieConsent from '@/components/cookie-consent'
import DomainGuard from '@/components/domain-guard'
import { AppInitializer } from '@/components/app-initializer'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Zenya - Your AI Learning Companion',
  description: 'Calm, focused AI tutoring built for neurodiverse learners',
  keywords: ['ADHD', 'learning', 'AI tutor', 'neurodiverse', 'education', 'adult learning', 'micro-learning'],
  authors: [{ name: 'Zenya Team' }],
  metadataBase: new URL('https://zenyaai.com'),
  openGraph: {
    title: 'Zenya - Your AI Learning Companion',
    description: 'Calm, focused AI tutoring built for neurodiverse learners',
    url: 'https://zenyaai.com',
    siteName: 'Zenya',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zenya - AI-powered learning for ADHD minds',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zenya - Your AI Learning Companion',
    description: 'Calm, focused AI tutoring built for neurodiverse learners',
    images: ['/og-image.png'],
    creator: '@zenyaai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code',
  },
}

export const viewport = {
  themeColor: '#3B82F6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className={`${inter.className} min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
        {/* Skip Navigation Links */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <a 
          href="#navigation" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none"
        >
          Skip to navigation
        </a>
        
        <DomainGuard>
          <Providers>
            <AppInitializer>
              {children}
            </AppInitializer>
            <CookieConsent />
          </Providers>
        </DomainGuard>
        <Analytics />
        <SpeedInsights />
        
        {/* Google Analytics with GDPR consent */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1SHGT2BP2J"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Default consent mode
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied'
            });
            
            gtag('config', 'G-1SHGT2BP2J');
          `}
        </Script>
      </body>
    </html>
  )
}