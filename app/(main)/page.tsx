'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import MoodSelector from '@/components/mood-selector'
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
    <div className="min-h-screen gradient-mesh">
      <div className="container mx-auto px-4 py-8 max-w-5xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className="text-center mb-16">
            <motion.h1 
              className="heading-responsive font-bold mb-4 text-gradient"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {greeting}, {user?.id ? 'friend' : 'there'}! 👋
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Welcome to Zenya - Your calm learning companion
            </motion.p>
          </header>

          {/* Quick Access Links */}
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              First time here? Check out our{' '}
              <Link href="/landing" className="text-blue-600 hover:underline">
                features
              </Link>{' '}
              or{' '}
              <Link href="/about" className="text-blue-600 hover:underline">
                learn more about us
              </Link>
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Mood Selection */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card variant="glass" className="shadow-premium hover:shadow-2xl transition-all duration-300">
                <CardContent className="py-10">
                  <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-100">
                    How are you feeling today?
                  </h2>
                  <MoodSelector value={selectedMood} onChange={handleMoodSelect} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Daily Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card variant="glass-subtle" className="shadow-premium hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Today's Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Progress value={dailyXP} max={100} showLabel size="lg" className="h-3" />
                    <div className="absolute inset-0 h-3 rounded-full overflow-hidden">
                      <div className="progress-fill h-full" style={{ width: `${dailyXP}%` }} />
                    </div>
                  </div>
                  <p className="mt-4 text-responsive text-gray-600 dark:text-gray-300">
                    {dailyXP === 0
                      ? '✨ Ready to start your learning journey?'
                      : `🎉 Great job! You've earned ${dailyXP} XP today!`}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Start Session Button */}
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button
                size="lg"
                onClick={handleStartSession}
                disabled={!selectedMood}
                className="btn-premium px-12 py-6 text-lg font-semibold rounded-2xl"
              >
                Start Learning Session
              </Button>
            </motion.div>

            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card variant="glass-subtle" className="shadow-sm hover:shadow-premium transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-2xl animate-pulse-slow">💡</span>
                    Quick Tips for Success
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 text-responsive text-gray-700 dark:text-gray-300">
                    <motion.li 
                      className="flex items-start group"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="mr-3 text-2xl group-hover:scale-110 transition-transform">🎯</span>
                      <span>Focus on one lesson at a time - no rush!</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-start group"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="mr-3 text-2xl group-hover:scale-110 transition-transform">🧠</span>
                      <span>Use "Gentle Pace" mode when you need a slower approach</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-start group"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="mr-3 text-2xl group-hover:scale-110 transition-transform">🎉</span>
                      <span>Celebrate small wins - every lesson counts!</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-start group"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="mr-3 text-2xl group-hover:scale-110 transition-transform">💪</span>
                      <span>Your pace is the right pace</span>
                    </motion.li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}