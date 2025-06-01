'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
import MoodSelector from '@/components/mood-selector'
import { useStore } from '@/lib/store'
import { toast } from 'react-hot-toast'

const iconMap: { [key: string]: any } = {
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
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({ lessonsCompleted: 0 })

  useEffect(() => {
    fetchCurricula()
    if (user) {
      fetchUserStats()
    }
  }, [user])

  const fetchCurricula = async () => {
    try {
      const response = await fetch('/api/curriculums')
      const data = await response.json()
      
      if (response.ok) {
        setCurricula(data.curriculums || [])
      } else {
        toast.error('Failed to load curriculums')
      }
    } catch (error) {
      toast.error('Failed to load curriculums')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (response.ok && data.profile) {
        setUserStats({
          lessonsCompleted: data.profile.lessons_completed || 0
        })
      }
    } catch (error) {
      // Silent fail for stats
    }
  }

  const handleStartCurriculum = (curriculumSlug: string) => {
    router.push(`/learn/${curriculumSlug}`)
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <AppNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Start Learning</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose a curriculum and begin your personalized learning journey
          </p>
        </motion.div>

        {/* Mood Selector */}
        <motion.div
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
                value={user?.mood || null}
                onChange={updateMood}
              />
              {user?.mood && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  Great! We'll adjust the pace and content to match your {user.mood} mood.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Curricula Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curricula.map((curriculum, index) => (
            <motion.div
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
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
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
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lessons Completed</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}