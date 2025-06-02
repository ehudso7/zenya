'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Settings, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already set preferences
    const savedPreferences = localStorage.getItem('cookiePreferences')
    if (!savedPreferences) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000)
    } else {
      // Load saved preferences
      const prefs = JSON.parse(savedPreferences)
      setPreferences(prefs)
      applyCookiePreferences(prefs)
    }
  }, [])

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Apply preferences to analytics and marketing scripts
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (prefs.analytics) {
        // Enable GA
        (window as any).gtag?.('consent', 'update', {
          analytics_storage: 'granted'
        })
      } else {
        // Disable GA
        (window as any).gtag?.('consent', 'update', {
          analytics_storage: 'denied'
        })
      }

      // Marketing cookies
      if (prefs.marketing) {
        // Enable marketing cookies
        (window as any).gtag?.('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted'
        })
      } else {
        // Disable marketing cookies
        (window as any).gtag?.('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        })
      }
    }
  }

  const acceptAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(newPreferences)
    localStorage.setItem('cookiePreferences', JSON.stringify(newPreferences))
    applyCookiePreferences(newPreferences)
    setShowBanner(false)
  }

  const rejectAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    setPreferences(newPreferences)
    localStorage.setItem('cookiePreferences', JSON.stringify(newPreferences))
    applyCookiePreferences(newPreferences)
    setShowBanner(false)
  }

  const savePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences))
    applyCookiePreferences(preferences)
    setShowSettings(false)
    setShowBanner(false)
  }

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
          >
            <Card className="max-w-5xl mx-auto glass backdrop-blur-xl border-white/20 shadow-2xl">
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">We value your privacy 🍪</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      We use cookies to enhance your learning experience, analyze site traffic, and personalize content. 
                      You can choose which cookies you&apos;d like to accept.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        size="sm"
                        onClick={acceptAll}
                        className="btn-premium"
                      >
                        Accept All
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={rejectAll}
                      >
                        Reject All
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Customize
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBanner(false)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                  >
                    <h4 className="font-medium mb-4">Cookie Preferences</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label htmlFor="necessary" className="font-medium">
                            Necessary Cookies
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Essential for the website to function. Cannot be disabled.
                          </p>
                        </div>
                        <Switch
                          id="necessary"
                          checked={preferences.necessary}
                          disabled
                          className="ml-4"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label htmlFor="analytics" className="font-medium">
                            Analytics Cookies
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Help us understand how you use Zenya to improve your experience.
                          </p>
                        </div>
                        <Switch
                          id="analytics"
                          checked={preferences.analytics}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, analytics: checked }))
                          }
                          className="ml-4"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label htmlFor="marketing" className="font-medium">
                            Marketing Cookies
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Used to show you relevant content and measure ad effectiveness.
                          </p>
                        </div>
                        <Switch
                          id="marketing"
                          checked={preferences.marketing}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, marketing: checked }))
                          }
                          className="ml-4"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        size="sm"
                        onClick={savePreferences}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Save Preferences
                      </Button>
                    </div>
                  </motion.div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    By using our site, you agree to our{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>
                    . You can change your preferences anytime.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating cookie settings button */}
      {!showBanner && (
        <button
          onClick={() => setShowBanner(true)}
          className="fixed bottom-4 left-4 z-40 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Cookie Settings"
        >
          <Cookie className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      )}
    </>
  )
}