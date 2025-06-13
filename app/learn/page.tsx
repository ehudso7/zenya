'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Play,
  BarChart,
  Brain,
  Calculator,
  Globe,
  Beaker,
  BookOpenCheck,
  Compass
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AppNavigation from '@/components/app-navigation'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { Mood } from '@/types'

// Dynamic imports for heavy components
const MoodSelector = dynamic(() => import('@/components/mood-selector'), {
  loading: () => (
    <div className="flex gap-4 justify-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      ))}
    </div>
  ),
  ssr: false
})

// Dynamic import for framer-motion
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => mod.motion.div),
  { ssr: false }
)

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'math-basics': Calculator,
  'web-dev-101': Globe,
  'english-grammar': BookOpenCheck,
  'science-explorers': Beaker,
  'history-adventures': Compass
}

const colorMap: { [key: string]: string } = {
  'math-basics': 'from-blue-500 to-indigo-600',
  'web-dev-101': 'from-purple-500 to-pink-600',
  'english-grammar': 'from-green-500 to-teal-600',
  'science-explorers': 'from-orange-500 to-red-600',
  'history-adventures': 'from-amber-500 to-yellow-600'
}

type Curriculum = {
  id: string
  title: string
  description: string
  slug: string
  difficulty_level: string
  estimated_hours: number
  is_active: boolean
}

export default function LearnPage() {
  const router = useRouter()
  const { user, updateMood } = useStore()
  const [curricula, setCurricula] = useState<Curriculum[]>([])
  const [_loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({ lessonsCompleted: 0 })
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)

  useEffect(() => {
    const abortController = new AbortController()
    
    const loadData = async () => {
      try {
        await fetchCurricula()
        if (user) {
          await fetchUserStats()
          // Sync mood if user has one but local state doesn't
          if (user.mood && !selectedMood) {
            setSelectedMood(user.mood)
          }
        }
      } catch (_error) {
        // Error handled by individual fetch functions
      }
    }
    
    loadData()
    
    return () => {
      abortController.abort()
    }
  }, [user, selectedMood])

  const fetchCurricula = async () => {
    try {
      const data = await api.get<{ curriculums: Curriculum[] }>('/api/curriculums')
      setCurricula(data.curriculums || [])
    } catch (_error) {
      // Error is already handled by api client with toast
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const data = await api.get<{ profile: any }>('/api/profile', { showErrorToast: false })
      
      if (data.profile) {
        setUserStats({
          lessonsCompleted: data.profile.lessons_completed || 0
        })
      }
    } catch (_error) {
      // Silent fail for stats
    }
  }

  const handleStartCurriculum = (curriculumSlug: string) => {
    router.push(`/learn/${curriculumSlug}`)
  }

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood)
    
    if (user) {
      updateMood(mood)
    } else {
      // Store mood temporarily even if not logged in
      // This allows the UI to update immediately
    }
  }

  if (_loading) {
    return (
      <div className="min-h-screen gradient-mesh">
        <AppNavigation />
        
        <div 
          className="container mx-auto px-4 py-8 max-w-6xl"
          aria-busy="true"
          aria-live="polite"
        >
          {/* Loading Header */}
          <div className="mb-8 animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" aria-hidden="true"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" aria-hidden="true"></div>
          </div>

          {/* Loading Mood Selector */}
          <div className="mb-8">
            <Card className="glass">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" aria-hidden="true"></div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 justify-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" aria-hidden="true"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loading Curricula Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="glass h-full animate-pulse">
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" aria-hidden="true"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" aria-hidden="true"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" aria-hidden="true"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" aria-hidden="true"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" aria-hidden="true"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20" aria-hidden="true"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" aria-hidden="true"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <span className="sr-only">Loading available courses</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <AppNavigation />
      
      <main id="main-content" className="container mx-auto px-4 py-8 max-w-6xl" role="main">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Start Learning</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose a curriculum and begin your personalized learning journey
          </p>
        </MotionDiv>

        {/* Mood Selector */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                How are you feeling today?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MoodSelector 
                value={selectedMood || user?.mood || null}
                onChange={handleMoodSelect}
              />
              {(selectedMood || user?.mood) && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  Great! We'll adjust the pace and content to match your {selectedMood || user?.mood} mood.
                </p>
              )}
            </CardContent>
          </Card>
        </MotionDiv>

        {/* Curricula Grid */}
        {curricula.length === 0 ? (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No Curricula Available
            </h2>
            <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto">
              We're working on creating amazing learning content for you. Check back soon!
            </p>
          </MotionDiv>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curricula.map((curriculum, index) => (
            <MotionDiv
              key={curriculum.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="glass h-full hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[curriculum.slug] || 'from-gray-500 to-gray-600'} flex items-center justify-center mb-4`}>
                    {iconMap[curriculum.slug] ? (
                      <>{(() => {
                        const Icon = iconMap[curriculum.slug]
                        return <Icon className="w-6 h-6 text-white" />
                      })()}</>
                    ) : (
                      <BookOpen className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <CardTitle className="text-xl">{curriculum.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {curriculum.estimated_hours} hours
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {curriculum.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full capitalize">
                      {curriculum.difficulty_level}
                    </span>
                    
                    <Button
                      onClick={() => handleStartCurriculum(curriculum.slug)}
                      className="btn-primary"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
          </div>
        )}

        {/* Quick Stats */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          <Card className="glass">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <p className="text-2xl font-bold">{user?.current_xp || 0} XP</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="p-6 text-center">
              <BarChart className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <p className="text-2xl font-bold">{user?.streak_count || 0} Days</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <p className="text-2xl font-bold">{userStats.lessonsCompleted}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lessons Completed</p>
            </CardContent>
          </Card>
        </MotionDiv>
      </main>
    </div>
  )
}