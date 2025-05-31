'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { MoodSelector } from '@/components/mood-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/lib/store'
import { getGreeting } from '@/lib/utils'
import type { Mood } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const { user, updateMood, dailyXP } = useStore()
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [greeting] = useState(getGreeting())

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood)
    updateMood(mood)
  }

  const handleStartSession = () => {
    if (!selectedMood) {
      toast.error('Please select how you\'re feeling first!')
      return
    }
    router.push('/learn')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">
              {greeting}, {user?.id ? 'friend' : 'there'}! 👋
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Welcome to Zenya - Your calm learning companion
            </p>
          </header>

          <div className="space-y-8">
            {/* Mood Selection */}
            <Card>
              <CardContent className="py-8">
                <MoodSelector value={selectedMood} onChange={handleMoodSelect} />
              </CardContent>
            </Card>

            {/* Daily Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={dailyXP} max={100} showLabel size="lg" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {dailyXP === 0
                    ? 'Ready to start your learning journey?'
                    : `Great job! You've earned ${dailyXP} XP today!`}
                </p>
              </CardContent>
            </Card>

            {/* Start Session Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleStartSession}
                disabled={!selectedMood}
                className="px-8 py-4 text-lg"
              >
                Start Learning Session
              </Button>
            </div>

            {/* Quick Tips */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips for Success</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="mr-2">🎯</span>
                    <span>Focus on one lesson at a time - no rush!</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">🧠</span>
                    <span>Use "Brain Fog Mode" if things feel overwhelming</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">🎉</span>
                    <span>Celebrate small wins - every lesson counts!</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">💪</span>
                    <span>Your pace is the right pace</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}