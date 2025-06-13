'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Clock, 
  Target,
  Trophy,
  AlertCircle,
  Sparkles,
  Brain,
  MessageSquare,
  BookOpen,
  Video,
  FileText,
  ChevronRight,
  ChevronLeft,
  Grid,
  List,
  Zap,
  Award,
  BarChart,
  Lock,
  Headphones,
  FileQuestion,
  Code,
  Users,
  Download,
  ExternalLink,
  Star,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import AppNavigation from '@/components/app-navigation'
import { AiChat } from '@/components/ai-chat'
import { toast } from 'react-hot-toast'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'

// Dynamic imports for heavy components
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => mod.motion.div),
  { ssr: false }
)

const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => mod.AnimatePresence),
  { ssr: false }
)

const Celebration = dynamic(
  () => import('@/components/celebration').then(mod => ({ default: mod.Celebration })),
  { ssr: false }
)

interface Props {
  params: Promise<{ curriculumSlug: string }>
}

type Lesson = {
  id: string
  title: string
  content: string
  content_blocks?: any[]
  duration_minutes: number
  difficulty_level: string
  xp_reward: number
  coins_reward?: number
  order_index: number
  lesson_type?: string
  video_url?: string
  resources?: any[]
  quiz_data?: any[]
  is_premium?: boolean
  user_progress?: {
    status: string
    completed_at: string | null
    xp_earned: number
    score?: number
    time_spent_seconds?: number
  }
}

type Curriculum = {
  id: string
  title: string
  description: string
  slug: string
  category?: string
  difficulty_level?: string
  estimated_hours?: number
  rating?: number
  enrollment_count?: number
  metadata?: {
    lesson_count?: number
    icon?: string
    color?: string
    highlights?: string[]
  }
}

type PaginationInfo = {
  page: number
  limit: number
  total: number
  totalPages: number
}

const lessonTypeIcons = {
  introduction: BookOpen,
  video: Video,
  exercise: Brain,
  project: Code,
  quiz: FileQuestion,
  advanced: Zap,
  collaborative: Users,
  audio: Headphones,
  standard: FileText
}

const difficultyColors = {
  easy: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  medium: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
  hard: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
}

export default function EnhancedCurriculumPage({ params }: Props) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useStore()
  
  // State management
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [lessonStarted, setLessonStarted] = useState(false)
  const [lessonContent, setLessonContent] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showAiChat, setShowAiChat] = useState(false)
  
  // Enhanced state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [allLessonsLoaded, setAllLessonsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [_showPracticeMode, setShowPracticeMode] = useState(false)

  // Computed values
  const currentLesson = lessons[currentLessonIndex]
  const completedLessons = lessons.filter(l => l.user_progress?.status === 'completed').length
  const progress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0
  const totalXPEarned = lessons.reduce((sum, l) => sum + (l.user_progress?.xp_earned || 0), 0)
  const totalTimeSpent = lessons.reduce((sum, l) => sum + (l.user_progress?.time_spent_seconds || 0), 0)
  
  // Filter lessons based on criteria
  const filteredLessons = lessons.filter(lesson => {
    if (filterDifficulty !== 'all' && lesson.difficulty_level !== filterDifficulty) return false
    if (filterType !== 'all' && lesson.lesson_type !== filterType) return false
    return true
  })

  // Fetch lessons with pagination
  const fetchLessons = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1 && !append) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      // First get curriculum info if we don't have it
      if (!curriculum) {
        const currData = await api.get<{ curriculums: Curriculum[] }>('/api/curriculums')
        const curr = currData.curriculums?.find((c: Curriculum) => c.slug === resolvedParams.curriculumSlug)
        
        if (!curr) {
          toast.error('Curriculum not found')
          router.push('/learn')
          return
        }
        
        setCurriculum(curr)
      }
      
      const currId = curriculum?.id || (await api.get<{ curriculums: Curriculum[] }>('/api/curriculums')).curriculums?.find((c: Curriculum) => c.slug === resolvedParams.curriculumSlug)?.id
      
      if (!currId) {
        throw new Error('Curriculum not found')
      }

      // Fetch lessons with pagination
      const lessonsData = await api.get<{ 
        lessons: Lesson[]
        pagination: PaginationInfo 
      }>(`/api/lessons?curriculumId=${currId}&page=${page}&limit=20&sortBy=order_index&sortOrder=asc`)
      
      if (append) {
        setLessons(prev => [...prev, ...lessonsData.lessons])
      } else {
        setLessons(lessonsData.lessons || [])
      }
      
      setPagination(lessonsData.pagination)
      setCurrentPage(page)
      
      // Check if all lessons are loaded
      if (lessonsData.pagination && 
          (lessonsData.lessons.length + (append ? lessons.length : 0)) >= lessonsData.pagination.total) {
        setAllLessonsLoaded(true)
      }
      
      // Find first incomplete lesson on initial load
      if (!append && lessonsData.lessons.length > 0) {
        const firstIncomplete = lessonsData.lessons.findIndex((l: Lesson) => 
          l.user_progress?.status !== 'completed'
        )
        if (firstIncomplete !== -1) {
          setCurrentLessonIndex(firstIncomplete)
        }
      }
    } catch (_error) {
      if (!curriculum && !append) {
        router.push('/learn')
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [curriculum, resolvedParams.curriculumSlug, router, lessons.length])

  const loadMoreLessons = useCallback(() => {
    if (pagination && currentPage < pagination.totalPages && !loadingMore) {
      fetchLessons(currentPage + 1, true)
    }
  }, [currentPage, pagination, loadingMore, fetchLessons])

  useEffect(() => {
    fetchLessons(1, false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.curriculumSlug])

  const handleStartLesson = async () => {
    if (!currentLesson) return
    
    // Check if premium lesson and user has access
    if (currentLesson.is_premium && (!user || user.subscription_status !== 'active')) {
      toast.error('This is a premium lesson. Please upgrade to access.')
      router.push('/pricing')
      return
    }
    
    setLessonStarted(true)
    setStartTime(Date.now())
    
    try {
      // Fetch full lesson content with mood adaptation
      const data = await api.get<{ lesson: Lesson }>(
        `/api/lessons/${currentLesson.id}?mood=${user?.mood || 'neutral'}`
      )
      
      setLessonContent(data.lesson)
      
      // Show mood-adapted message based on emoji mood
      const moodToMessage: Record<string, string> = {
        '🔥': `🚀 Let's dive into ${currentLesson.title}!`,
        '😄': `😊 Ready to learn ${currentLesson.title}!`,
        '🙂': `🔍 Let's explore ${currentLesson.title} together!`,
        '😐': `🎯 Time to master ${currentLesson.title}!`,
        '😴': `🌊 Let's ease into ${currentLesson.title}!`
      }
      
      toast.success(moodToMessage[user?.mood || ''] || `Starting: ${currentLesson.title}`)
    } catch (_error) {
      // Error is already handled by api client with toast
    }
  }

  const handleCompleteLesson = async () => {
    if (!currentLesson || completing) return
    
    setCompleting(true)
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    
    try {
      const data = await api.post<{
        xp_earned: number
        achievements?: Array<{ achievement_name: string }>
      }>(`/api/lessons/${currentLesson.id}`, {
        action: 'complete',
        timeSpent,
        mood: user?.mood
      })
      
      toast.success(`🎉 +${data.xp_earned} XP earned!`)
      
      // Show celebration animation
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 4000)
      
      // Show achievements if any
      if (data.achievements && data.achievements.length > 0) {
        data.achievements.forEach((achievement: { achievement_name: string }) => {
          toast.success(`🏆 Achievement unlocked: ${achievement.achievement_name}!`, {
            duration: 5000
          })
        })
      }
      
      // Update local state
      const updatedLessons = [...lessons]
      updatedLessons[currentLessonIndex].user_progress = {
        status: 'completed',
        completed_at: new Date().toISOString(),
        xp_earned: data.xp_earned,
        time_spent_seconds: timeSpent
      }
      setLessons(updatedLessons)
      
      // Move to next lesson or finish
      if (currentLessonIndex < filteredLessons.length - 1) {
        const nextIndex = lessons.indexOf(filteredLessons[currentLessonIndex + 1])
        setCurrentLessonIndex(nextIndex)
        setLessonStarted(false)
        setLessonContent(null)
      } else {
        toast.success('🎓 Congratulations! You\'ve completed all lessons!')
        router.push('/learn')
      }
    } catch (_error) {
      // Error is already handled by api client with toast
    } finally {
      setCompleting(false)
    }
  }

  const handlePracticeMode = async () => {
    if (!currentLesson || !curriculum) {
      toast.error('Please select a lesson first')
      return
    }

    try {
      setShowPracticeMode(true)
      
      // Call the practice API to track the interaction
      await api.post('/api/practice', {
        lessonId: currentLesson.id,
        curriculumId: curriculum.id,
        action: 'start',
        mood: user?.mood
      })
      
      toast.success('Practice mode activated! Work through exercises at your own pace.')
    } catch (error) {
      console.error('Practice mode error:', error)
      // Still show practice mode even if tracking fails
      toast.success('Practice mode activated!')
    }
  }

  const renderLessonContent = () => {
    if (!lessonContent) return null

    // Enhanced content rendering with mood adaptation
    const moodStyles: Record<string, string> = {
      '🔥': 'prose-lg',
      '😄': 'prose-lg',
      '🙂': 'prose',
      '😐': 'prose-sm',
      '😴': 'prose-xl'
    }

    const proseClass = moodStyles[user?.mood || ''] || 'prose-lg'

    // Parse content blocks if available
    if (lessonContent.content_blocks && lessonContent.content_blocks.length > 0) {
      return (
        <div className="space-y-6">
          {lessonContent.content_blocks.map((block: any, index: number) => {
            switch (block.type) {
              case 'text':
                return (
                  <div key={index} className={`${proseClass} prose dark:prose-invert max-w-none`}>
                    <div dangerouslySetInnerHTML={{ __html: block.content }} />
                  </div>
                )
              case 'code':
                return (
                  <div key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="font-mono text-sm">
                      <code className={`language-${block.language || 'javascript'}`}>
                        {block.content}
                      </code>
                    </pre>
                  </div>
                )
              case 'video':
                return (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={block.url}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )
              case 'quiz':
                return (
                  <Card key={index} className="glass border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="text-blue-700 dark:text-blue-300">
                        Quick Check
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{block.question}</p>
                      <div className="space-y-2">
                        {block.options?.map((option: string, i: number) => (
                          <Button
                            key={i}
                            variant="secondary"
                            className="w-full justify-start"
                            onClick={() => toast.success('Answer recorded!')}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              default:
                return null
            }
          })}
        </div>
      )
    }

    // Fallback to simple content rendering
    const sections = lessonContent.content.split('\n\n')
    
    return (
      <div className="space-y-6">
        {sections.map((section: string, index: number) => {
          if (section.startsWith('```')) {
            const code = section.replace(/```/g, '').trim()
            return (
              <div key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{code}</pre>
              </div>
            )
          }
          
          return (
            <div key={index} className={`${proseClass} prose dark:prose-invert max-w-none`}>
              <p className="whitespace-pre-line">{section}</p>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh">
        <AppNavigation />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map(i => (
                <Card key={i} className="glass">
                  <CardContent className="p-8">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentLesson || !curriculum) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <Card className="glass p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-center">No lessons found</p>
          <Button onClick={() => router.push('/learn')} className="mt-4 w-full">
            Back to Learning
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <AppNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Enhanced Header */}
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/learn')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{curriculum.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {curriculum.description}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary">
                  {curriculum.category}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {curriculum.estimated_hours} hours • {pagination?.total || lessons.length} lessons
                </span>
                {curriculum.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{curriculum.rating}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Card className="glass px-4 py-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(progress)}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Complete</p>
                </div>
              </Card>
              <Card className="glass px-4 py-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalXPEarned}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">XP Earned</p>
                </div>
              </Card>
            </div>
          </div>
        </MotionDiv>

        {/* Main Content Area */}
        {!lessonStarted ? (
          <>
            {/* Tabs for different views */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Current Lesson Card */}
                <Card className="glass border-2 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        Continue Learning
                      </CardTitle>
                      {currentLesson.user_progress?.status === 'completed' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {currentLesson.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Lesson {currentLessonIndex + 1} of {pagination?.total || lessons.length}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-sm font-medium">{currentLesson.duration_minutes} min</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                        <p className="text-sm font-medium">{currentLesson.xp_reward} XP</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Target className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                        <p className="text-sm font-medium capitalize">{currentLesson.difficulty_level}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleStartLesson}
                        className="flex-1 btn-premium"
                        size="lg"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        {currentLesson.user_progress?.status === 'completed' ? 'Review Lesson' : 'Start Learning'}
                      </Button>
                      <Button
                        onClick={handlePracticeMode}
                        variant="secondary"
                        size="lg"
                      >
                        <Brain className="w-5 h-5 mr-2" />
                        Practice
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Path */}
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Your Learning Path</CardTitle>
                    <CardDescription>
                      Track your progress through the curriculum
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Progress value={progress} className="h-3 mb-6" />
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{completedLessons} completed</span>
                        <span>{filteredLessons.length - completedLessons} remaining</span>
                      </div>
                    </div>

                    {/* Next up section */}
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Next Up</h4>
                      <div className="space-y-2">
                        {filteredLessons
                          .filter(l => l.user_progress?.status !== 'completed')
                          .slice(0, 3)
                          .map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                                {lessons.indexOf(lesson) + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{lesson.title}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {lesson.duration_minutes} min • {lesson.xp_reward} XP
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Highlights */}
                {curriculum.metadata?.highlights && (
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Course Highlights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {curriculum.metadata.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                            <p className="text-sm">{highlight}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="lessons" className="space-y-6">
                {/* Filters */}
                <Card className="glass">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>All Lessons</CardTitle>
                      <div className="flex items-center gap-2">
                        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="exercise">Exercise</SelectItem>
                            <SelectItem value="project">Project</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            size="sm"
                            variant={viewMode === 'list' ? 'primary' : 'ghost'}
                            onClick={() => setViewMode('list')}
                          >
                            <List className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                            onClick={() => setViewMode('grid')}
                          >
                            <Grid className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {viewMode === 'list' ? (
                      <div className="space-y-2">
                        {filteredLessons.map((lesson) => {
                          const isLocked = lesson.is_premium && (!user || user.subscription_status !== 'active')
                          const LessonIcon = lessonTypeIcons[lesson.lesson_type as keyof typeof lessonTypeIcons] || FileText
                          const actualIndex = lessons.indexOf(lesson)
                          
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => !isLocked && setCurrentLessonIndex(actualIndex)}
                              disabled={isLocked}
                              className={cn(
                                "w-full p-4 rounded-lg text-left transition-all",
                                actualIndex === currentLessonIndex 
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500' 
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent',
                                isLocked && 'opacity-60 cursor-not-allowed'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex-shrink-0">
                                    <div className={cn(
                                      "w-10 h-10 rounded-full flex items-center justify-center",
                                      lesson.user_progress?.status === 'completed' 
                                        ? 'bg-green-100 dark:bg-green-900/30' 
                                        : 'bg-gray-100 dark:bg-gray-800'
                                    )}>
                                      {lesson.user_progress?.status === 'completed' ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                      ) : (
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                          {actualIndex + 1}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <LessonIcon className="w-4 h-4 text-gray-400" />
                                      <span className="font-medium">{lesson.title}</span>
                                      {lesson.is_premium && (
                                        <Badge variant="secondary" className="text-xs">
                                          PRO
                                        </Badge>
                                      )}
                                      <Badge 
                                        variant="secondary" 
                                        className={cn("text-xs", difficultyColors[lesson.difficulty_level as keyof typeof difficultyColors])}
                                      >
                                        {lesson.difficulty_level}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {lesson.duration_minutes} min
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Zap className="w-3 h-3" />
                                        {lesson.xp_reward} XP
                                      </span>
                                      {lesson.coins_reward && (
                                        <span className="flex items-center gap-1">
                                          <Award className="w-3 h-3" />
                                          {lesson.coins_reward} coins
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isLocked ? (
                                    <Lock className="w-5 h-5 text-gray-400" />
                                  ) : lesson.user_progress?.status === 'completed' ? (
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                        {lesson.user_progress.score ? `${lesson.user_progress.score}%` : '✓'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {lesson.user_progress.xp_earned} XP
                                      </div>
                                    </div>
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                        
                        {/* Load More Button */}
                        {!allLessonsLoaded && pagination && currentPage < pagination.totalPages && (
                          <div className="mt-4 text-center">
                            <Button
                              onClick={loadMoreLessons}
                              variant="secondary"
                              disabled={loadingMore}
                              className="w-full"
                            >
                              {loadingMore ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                  Loading more lessons...
                                </>
                              ) : (
                                <>
                                  Load More Lessons
                                  <ChevronRight className="w-4 h-4 ml-2" />
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Grid View */
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredLessons.map((lesson) => {
                          const isLocked = lesson.is_premium && (!user || user.subscription_status !== 'active')
                          const LessonIcon = lessonTypeIcons[lesson.lesson_type as keyof typeof lessonTypeIcons] || FileText
                          const actualIndex = lessons.indexOf(lesson)
                          
                          return (
                            <Card
                              key={lesson.id}
                              className={cn(
                                "cursor-pointer transition-all hover:shadow-lg",
                                actualIndex === currentLessonIndex && 'ring-2 ring-blue-500',
                                isLocked && 'opacity-60 cursor-not-allowed'
                              )}
                              onClick={() => !isLocked && setCurrentLessonIndex(actualIndex)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <LessonIcon className="w-5 h-5 text-gray-400" />
                                    <CardTitle className="text-base">
                                      Lesson {actualIndex + 1}
                                    </CardTitle>
                                  </div>
                                  {isLocked ? (
                                    <Lock className="w-5 h-5 text-gray-400" />
                                  ) : lesson.user_progress?.status === 'completed' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : null}
                                </div>
                              </CardHeader>
                              <CardContent>
                                <h4 className="font-medium mb-2 line-clamp-2">{lesson.title}</h4>
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge 
                                    variant="secondary" 
                                    className={cn("text-xs", difficultyColors[lesson.difficulty_level as keyof typeof difficultyColors])}
                                  >
                                    {lesson.difficulty_level}
                                  </Badge>
                                  {lesson.is_premium && (
                                    <Badge variant="secondary" className="text-xs">
                                      PRO
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration_minutes}m
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    {lesson.xp_reward} XP
                                  </span>
                                </div>
                                {lesson.user_progress?.status === 'completed' && (
                                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-green-600 dark:text-green-400">Completed</span>
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {lesson.user_progress.xp_earned} XP earned
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })}
                        
                        {/* Load More in Grid */}
                        {!allLessonsLoaded && pagination && currentPage < pagination.totalPages && (
                          <Card 
                            className="cursor-pointer transition-all hover:shadow-lg flex items-center justify-center min-h-[200px]"
                            onClick={loadMoreLessons}
                          >
                            <CardContent className="text-center">
                              {loadingMore ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto" />
                              ) : (
                                <>
                                  <ChevronRight className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Load more lessons
                                  </p>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Learning Resources</CardTitle>
                    <CardDescription>
                      Additional materials to enhance your learning
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Mock resources - these would come from the API */}
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Download className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium">Course Workbook</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Comprehensive PDF guide with exercises
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Code className="w-5 h-5 text-purple-500 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium">Code Sandbox</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Practice environment for hands-on learning
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-green-500 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium">Study Group</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Join collaborative learning sessions
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <ExternalLink className="w-5 h-5 text-orange-500 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium">External Links</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Curated resources from around the web
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="space-y-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                    <CardDescription>
                      Detailed insights into your learning journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Overall Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                        <BarChart className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {Math.round(progress)}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {totalXPEarned}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">XP Earned</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {Math.round(totalTimeSpent / 60)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Minutes</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {completedLessons}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Lesson Breakdown */}
                    <div>
                      <h4 className="font-medium mb-4">Lesson Breakdown</h4>
                      <div className="space-y-3">
                        {['easy', 'medium', 'hard'].map(difficulty => {
                          const difficultyLessons = lessons.filter(l => l.difficulty_level === difficulty)
                          const completed = difficultyLessons.filter(l => l.user_progress?.status === 'completed').length
                          const percentage = difficultyLessons.length > 0 ? (completed / difficultyLessons.length) * 100 : 0
                          
                          return (
                            <div key={difficulty}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="capitalize font-medium">{difficulty}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {completed}/{difficultyLessons.length} lessons
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Recent Activity */}
                    <div>
                      <h4 className="font-medium mb-4">Recent Activity</h4>
                      <div className="space-y-2">
                        {lessons
                          .filter(l => l.user_progress?.completed_at)
                          .sort((a, b) => new Date(b.user_progress!.completed_at!).getTime() - new Date(a.user_progress!.completed_at!).getTime())
                          .slice(0, 5)
                          .map(lesson => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <div>
                                  <p className="font-medium text-sm">{lesson.title}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {new Date(lesson.user_progress!.completed_at!).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary">
                                +{lesson.user_progress!.xp_earned} XP
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Mood Impact */}
                    {user?.mood && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-4">Mood-Based Learning</h4>
                          <Card className={cn(
                            "border-2",
                            user.mood === '🔥' && "border-orange-300 bg-orange-50 dark:bg-orange-900/10",
                            user.mood === '😄' && "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10",
                            user.mood === '🙂' && "border-blue-300 bg-blue-50 dark:bg-blue-900/10",
                            user.mood === '😐' && "border-purple-300 bg-purple-50 dark:bg-purple-900/10",
                            user.mood === '😴' && "border-green-300 bg-green-50 dark:bg-green-900/10"
                          )}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Brain className="w-6 h-6" />
                                <div>
                                  <p className="font-medium">Current Mood: {user.mood}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Your content is being adapted to match your {user.mood} learning state
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          /* Lesson View */
          <AnimatePresence mode="wait">
            <MotionDiv
              key="lesson-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <button
                  onClick={() => setLessonStarted(false)}
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {curriculum.title}
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 dark:text-gray-100">
                  {currentLesson.title}
                </span>
              </div>

              {/* Content Card */}
              <Card className="glass">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLessonStarted(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {currentLesson.duration_minutes} minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {currentLesson.xp_reward} XP
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", difficultyColors[currentLesson.difficulty_level as keyof typeof difficultyColors])}
                      >
                        {currentLesson.difficulty_level}
                      </Badge>
                    </div>
                  </div>

                  {/* Lesson Content */}
                  {renderLessonContent()}

                  {/* Resources Section */}
                  {lessonContent?.resources && lessonContent.resources.length > 0 && (
                    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Lesson Resources
                      </h3>
                      <div className="space-y-2">
                        {lessonContent.resources.map((resource: any, idx: number) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {resource.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Chat Toggle */}
                  <div className="mt-6">
                    <Button
                      variant="secondary"
                      onClick={() => setShowAiChat(!showAiChat)}
                      className="w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {showAiChat ? 'Hide AI Tutor' : 'Ask AI Tutor'}
                    </Button>
                  </div>

                  {/* Navigation */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      {currentLessonIndex > 0 ? (
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setCurrentLessonIndex(currentLessonIndex - 1)
                            setLessonStarted(false)
                            setLessonContent(null)
                          }}
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>
                      ) : (
                        <div />
                      )}
                      
                      <Button
                        onClick={handleCompleteLesson}
                        className="btn-premium"
                        size="lg"
                        disabled={completing}
                      >
                        {completing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Completing...
                          </>
                        ) : currentLesson.user_progress?.status === 'completed' ? (
                          <>
                            Next Lesson
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Complete & Continue
                            <Sparkles className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Chat */}
              {showAiChat && (
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="h-[600px]"
                >
                  <AiChat
                    lessonId={currentLesson.id}
                    lessonContext={`Learning about "${currentLesson.title}" in ${curriculum.title}. User mood: ${user?.mood || 'neutral'}`}
                    onSimplify={() => {
                      toast.success('Simplifying the content based on your mood...')
                    }}
                  />
                </MotionDiv>
              )}

              {/* Learning Tips - Mood Adapted */}
              <Card className={cn(
                "glass border-2",
                user?.mood === '🔥' && "border-orange-200 dark:border-orange-800",
                user?.mood === '😄' && "border-yellow-200 dark:border-yellow-800",
                user?.mood === '🙂' && "border-blue-200 dark:border-blue-800",
                user?.mood === '😐' && "border-purple-200 dark:border-purple-800",
                user?.mood === '😴' && "border-green-200 dark:border-green-800"
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    {user?.mood === '🔥' && "High Energy Learning Tips"}
                    {user?.mood === '😄' && "Positive Learning Tips"}
                    {user?.mood === '🙂' && "Exploration Tips"}
                    {user?.mood === '😐' && "Deep Focus Tips"}
                    {user?.mood === '😴' && "Relaxed Learning Tips"}
                    {!user?.mood && "Learning Tips"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {user?.mood === '🔥' && (
                      <>
                        <li>• Channel your energy into hands-on exercises!</li>
                        <li>• Try teaching what you learn to someone else</li>
                        <li>• Take on bonus challenges for extra XP</li>
                        <li>• Your excitement will help you retain more!</li>
                      </>
                    )}
                    {user?.mood === '😄' && (
                      <>
                        <li>• Your positive mood enhances memory formation</li>
                        <li>• Share your progress with the community</li>
                        <li>• Celebrate small wins along the way</li>
                        <li>• Try collaborative learning sessions!</li>
                      </>
                    )}
                    {user?.mood === '🙂' && (
                      <>
                        <li>• Explore related topics and go deeper</li>
                        <li>• Ask "why" and "how" questions to the AI</li>
                        <li>• Check out the additional resources</li>
                        <li>• Your curiosity is your superpower!</li>
                      </>
                    )}
                    {user?.mood === '😐' && (
                      <>
                        <li>• Perfect time for challenging concepts</li>
                        <li>• Try the Pomodoro technique (25min focus)</li>
                        <li>• Minimize distractions for deep learning</li>
                        <li>• Take detailed notes for better retention</li>
                      </>
                    )}
                    {user?.mood === '😴' && (
                      <>
                        <li>• Take your time - there's no rush!</li>
                        <li>• Use spaced repetition for better retention</li>
                        <li>• Take breaks when you need them</li>
                        <li>• Enjoy the learning journey!</li>
                      </>
                    )}
                    {!user?.mood && (
                      <>
                        <li>• Take your time - there's no rush!</li>
                        <li>• Try the examples yourself for better understanding</li>
                        <li>• Come back anytime to review this lesson</li>
                        <li>• Ask the AI tutor if something isn't clear!</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Progress Indicator */}
              <div className="fixed bottom-8 right-8 z-50">
                <Card className="glass shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 20}`}
                            strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                            className="text-blue-600 dark:text-blue-400 transition-all duration-300"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Course Progress</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {completedLessons}/{pagination?.total || lessons.length} lessons
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </MotionDiv>
          </AnimatePresence>
        )}
      </div>
      
      {/* Celebration Animation */}
      <Celebration show={showCelebration} />
    </div>
  )
}