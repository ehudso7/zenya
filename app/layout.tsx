import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zenya - Your AI Learning Companion',
  description: 'Calm, focused AI tutoring built for neurodiverse learners',
  keywords: ['ADHD', 'learning', 'AI tutor', 'neurodiverse', 'education'],
  authors: [{ name: 'Zenya Team' }],
  metadataBase: new URL('https://zenya.app'),
  openGraph: {
    title: 'Zenya - Your AI Learning Companion',
    description: 'Calm, focused AI tutoring built for neurodiverse learners',
    url: 'https://zenya.app',
    siteName: 'Zenya',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
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
  },
  manifest: '/manifest.json',
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
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}