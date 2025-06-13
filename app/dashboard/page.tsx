'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  BookOpen, 
  Trophy, 
  Zap,
  Brain,
  Target,
  Award,
  Clock,
  ChevronRight,
  Star,
  Flame,
  Users,
  MessageSquare,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppNavigation from '@/components/app-navigation'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'

// Dynamic imports
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => mod.motion.div),
  { ssr: false }
)

type DashboardStats = {
  totalXP: number
  currentStreak: number
  lessonsCompleted: number
  hoursLearned: number
  achievements: number
  level: number
  nextLevelXP: number
  weeklyGoalProgress: number
  recentActivity: Array<{
    type: string
    title: string
    xp: number
    timestamp: string
  }>
  upcomingLessons: Array<{
    id: string
    title: string
    curriculumTitle: string
    duration: number
    difficulty: string
  }>
}

type Curriculum = {
  id: string
  title: string
  slug: string
  progress: number
  lastAccessed?: string
  nextLesson?: string
}

const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500]

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeCurricula, setActiveCurricula] = useState<Curriculum[]>([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')

  const fetchDashboardData = async () => {
    try {
      // Fetch user stats
      const statsData = await api.get<DashboardStats>('/api/dashboard/stats')
      setStats(statsData)

      // Fetch active curricula
      const curriculaData = await api.get<{ curricula: Curriculum[] }>('/api/dashboard/active-curricula')
      setActiveCurricula(curriculaData.curricula || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Use fallback data
      setStats({
        totalXP: user?.current_xp || 0,
        currentStreak: user?.streak_count || 0,
        lessonsCompleted: 0,
        hoursLearned: 0,
        achievements: 0,
        level: user?.level || 1,
        nextLevelXP: 100,
        weeklyGoalProgress: 0,
        recentActivity: [],
        upcomingLessons: []
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    fetchDashboardData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const calculateLevel = (xp: number) => {
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (xp >= levelThresholds[i]) {
        return i + 1
      }
    }
    return 1
  }

  const calculateLevelProgress = (xp: number) => {
    const level = calculateLevel(xp)
    if (level >= levelThresholds.length) return 100
    
    const currentLevelXP = levelThresholds[level - 1]
    const nextLevelXP = levelThresholds[level]
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    
    return Math.round(progress)
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh">
        <AppNavigation />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-8" />
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="glass">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2" />
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <AppNavigation />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            {greeting}, {user?.name || user?.email?.split('@')[0] || 'Learner'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.mood ? (
              <>Feeling {user.mood} today? Let's make the most of it!</>
            ) : (
              <>Ready to continue your learning journey?</>
            )}
          </p>
        </MotionDiv>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats?.totalXP || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
                <Progress 
                  value={calculateLevelProgress(stats?.totalXP || 0)} 
                  className="mt-2 h-2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Level {calculateLevel(stats?.totalXP || 0)}
                </p>
              </CardContent>
            </Card>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats?.currentStreak || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
                <div className="flex gap-1 mt-2">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 flex-1 rounded-full",
                        i < (stats?.currentStreak || 0) % 7
                          ? "bg-orange-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats?.lessonsCompleted || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lessons Done</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {stats?.hoursLearned || 0} hours learned
                </p>
              </CardContent>
            </Card>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats?.achievements || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto text-xs mt-2 hover:bg-transparent"
                  onClick={() => router.push('/achievements')}
                >
                  View all →
                </Button>
              </CardContent>
            </Card>
          </MotionDiv>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="continue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="continue">Continue Learning</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="continue" className="space-y-6">
            {/* Active Curricula */}
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Active Courses</CardTitle>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => router.push('/learn')}
                  >
                    Browse All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeCurricula.length > 0 ? (
                  <div className="space-y-4">
                    {activeCurricula.map((curriculum) => (
                      <div
                        key={curriculum.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/learn/${curriculum.slug}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{curriculum.title}</h3>
                          <Badge variant="secondary">
                            {Math.round(curriculum.progress)}% complete
                          </Badge>
                        </div>
                        <Progress value={curriculum.progress} className="h-2 mb-2" />
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>Next: {curriculum.nextLesson || 'Continue learning'}</span>
                          <Button size="sm" variant="ghost">
                            <Play className="w-4 h-4 mr-1" />
                            Resume
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You haven't started any courses yet
                    </p>
                    <Button onClick={() => router.push('/learn')}>
                      Explore Courses
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card 
                className="glass hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/practice')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold">Quick Practice</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reinforce your learning with targeted exercises
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="glass hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/chat')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold">AI Tutor</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get instant help with any topic or question
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="glass hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/community')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold">Study Groups</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Learn together with peers and mentors
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your learning journey over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {activity.type === 'lesson' ? (
                            <BookOpen className="w-5 h-5 text-blue-500" />
                          ) : activity.type === 'achievement' ? (
                            <Trophy className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <Zap className="w-5 h-5 text-purple-500" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          +{activity.xp} XP
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No recent activity. Start learning to see your progress here!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Stats Chart */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Learning Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Time Distribution</h4>
                    <div className="space-y-3">
                      {['Morning', 'Afternoon', 'Evening', 'Night'].map((time, idx) => (
                        <div key={time}>
                          <div className="flex items-center justify-between mb-1 text-sm">
                            <span>{time}</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {[40, 30, 20, 10][idx]}%
                            </span>
                          </div>
                          <Progress value={[40, 30, 20, 10][idx]} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Subject Focus</h4>
                    <div className="space-y-3">
                      {['Programming', 'Mathematics', 'Language', 'Science'].map((subject, idx) => (
                        <div key={subject}>
                          <div className="flex items-center justify-between mb-1 text-sm">
                            <span>{subject}</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {[50, 25, 15, 10][idx]}%
                            </span>
                          </div>
                          <Progress value={[50, 25, 15, 10][idx]} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            {/* Weekly Goal */}
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Weekly Goal</CardTitle>
                  <Button variant="secondary" size="sm">
                    Edit Goal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Learn 5 hours this week</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stats?.weeklyGoalProgress || 0}% complete
                      </span>
                    </div>
                    <Progress value={stats?.weeklyGoalProgress || 0} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "text-center p-2 rounded-lg text-sm",
                          idx < new Date().getDay()
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-800"
                        )}
                      >
                        <p className="font-medium">{day}</p>
                        <p className="text-xs">{idx < new Date().getDay() ? '✓' : '-'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Milestones */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Upcoming Milestones</CardTitle>
                <CardDescription>
                  Your next achievements and rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium">Reach Level {(user?.level || 1) + 1}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {levelThresholds[(user?.level || 1)] - (user?.current_xp || 0)} XP to go
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        +50 coins
                      </Badge>
                    </div>
                    <Progress 
                      value={calculateLevelProgress(user?.current_xp || 0)} 
                      className="h-2"
                    />
                  </div>

                  <div className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        <div>
                          <p className="font-medium">30 Day Streak</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {30 - (user?.streak_count || 0)} days remaining
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        +100 XP
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="font-medium">Complete First Course</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Finish any curriculum with 100%
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        +200 XP
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Motivation Quote */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="glass bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-lg font-medium italic">
                    "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    — Brian Herbert
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </main>
    </div>
  )
}