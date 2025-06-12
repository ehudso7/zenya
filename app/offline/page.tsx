'use client'

import { Wifi, WifiOff, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function OfflinePage() {
  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <Card className="glass max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl">You're offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-400">
            No worries! Your learning progress is saved and you can continue with cached content.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
              <Wifi className="w-4 h-4 mr-2" />
              Available offline:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Previously viewed lessons</li>
              <li>• Saved curriculum progress</li>
              <li>• Learning materials</li>
              <li>• Your profile data</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
          
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
            Your actions will sync automatically when connection is restored.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}