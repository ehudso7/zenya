'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Play,
  BarChart,
  Brain,
  Code,
  Palette,
  Database
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AppNavigation from '@/components/app-navigation'
import MoodSelector from '@/components/mood-selector'
import { useStore } from '@/lib/store'

const curricula = [
  {
    id: 'web-dev-basics',
    title: 'Web Development Fundamentals',
    description: 'Learn HTML, CSS, and JavaScript basics with ADHD-friendly micro-lessons',
    icon: Code,
    modules: 6,
    hours: 20,
    level: 'Beginner',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'design-basics',
    title: 'Design Principles',
    description: 'Master the fundamentals of visual design and user experience',
    icon: Palette,
    modules: 4,
    hours: 15,
    level: 'Beginner',
    color: 'from-purple-500 to-pink-600',
    comingSoon: true
  },
  {
    id: 'data-basics',
    title: 'Data & Analytics',
    description: 'Introduction to data analysis and visualization',
    icon: Database,
    modules: 5,
    hours: 18,
    level: 'Intermediate',
    color: 'from-green-500 to-teal-600',
    comingSoon: true
  }
]

export default function LearnPage() {
  const router = useRouter()
  const { user, updateMood } = useStore()

  const handleStartCurriculum = (curriculumId: string) => {
    router.push(`/learn/${curriculumId}`)
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
              <Card className={`glass h-full ${curriculum.comingSoon ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${curriculum.color} flex items-center justify-center mb-4`}>
                    <curriculum.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{curriculum.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {curriculum.modules} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {curriculum.hours} hours
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {curriculum.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {curriculum.level}
                    </span>
                    
                    <Button
                      onClick={() => handleStartCurriculum(curriculum.id)}
                      disabled={curriculum.comingSoon}
                      className={curriculum.comingSoon ? '' : 'btn-primary'}
                      size="sm"
                    >
                      {curriculum.comingSoon ? (
                        'Coming Soon'
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Learning
                        </>
                      )}
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