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
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import AppNavigation from '@/components/app-navigation'
import { AiChat } from '@/components/ai-chat'
import { toast } from 'react-hot-toast'
import { useStore } from '@/lib/store'

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
  duration_minutes: number
  difficulty_level: string
  xp_reward: number
  order_index: number
  user_progress?: {
    status: string
    completed_at: string | null
    xp_earned: number
  }
}

type Curriculum = {
  id: string
  title: string
  description: string
  slug: string
}

export default function CurriculumLessonsPage({ params }: Props) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useStore()
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [lessonStarted, setLessonStarted] = useState(false)
  const [lessonContent, setLessonContent] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showAiChat, setShowAiChat] = useState(false)

  const currentLesson = lessons[currentLessonIndex]
  const completedLessons = lessons.filter(l => l.user_progress?.status === 'completed').length
  const progress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0

  const fetchLessons = useCallback(async () => {
    try {
      // First get curriculum info
      const currResponse = await fetch('/api/curriculums')
      const currData = await currResponse.json()
      
      if (currResponse.ok) {
        const curr = currData.curriculums?.find((c: Curriculum) => c.slug === resolvedParams.curriculumSlug)
        if (curr) {
          setCurriculum(curr)
          
          // Then get lessons for this curriculum
          const lessonsResponse = await fetch(`/api/lessons?curriculumId=${curr.id}`)
          const lessonsData = await lessonsResponse.json()
          
          if (lessonsResponse.ok) {
            setLessons(lessonsData.lessons || [])
            
            // Find first incomplete lesson
            const firstIncomplete = lessonsData.lessons?.findIndex((l: Lesson) => 
              l.user_progress?.status !== 'completed'
            )
            if (firstIncomplete !== -1) {
              setCurrentLessonIndex(firstIncomplete)
            }
          } else {
            toast.error('Failed to load lessons')
          }
        } else {
          toast.error('Curriculum not found')
          router.push('/learn')
        }
      }
    } catch (_error) {
      toast.error('Failed to load curriculum')
      router.push('/learn')
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.curriculumSlug, router])

  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

  const handleStartLesson = async () => {
    if (!currentLesson) return
    
    setLessonStarted(true)
    setStartTime(Date.now())
    
    try {
      // Fetch full lesson content
      const response = await fetch(`/api/lessons/${currentLesson.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setLessonContent(data.lesson)
        toast.success(`Starting: ${currentLesson.title}`)
      } else {
        toast.error('Failed to load lesson content')
      }
    } catch (_error) {
      toast.error('Failed to start lesson')
    }
  }

  const handleCompleteLesson = async () => {
    if (!currentLesson || completing) return
    
    setCompleting(true)
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    
    try {
      const response = await fetch(`/api/lessons/${currentLesson.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          timeSpent,
          mood: user?.mood
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(`🎉 +${data.xp_earned} XP earned!`)
        
        // Show celebration animation
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 4000)
        
        // Show achievements if any
        if (data.achievements?.length > 0) {
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
          xp_earned: data.xp_earned
        }
        setLessons(updatedLessons)
        
        // Move to next lesson or finish
        if (currentLessonIndex < lessons.length - 1) {
          setCurrentLessonIndex(currentLessonIndex + 1)
          setLessonStarted(false)
          setLessonContent(null)
        } else {
          toast.success('🎓 Congratulations! You\'ve completed all lessons!')
          router.push('/learn')
        }
      } else {
        toast.error('Failed to complete lesson')
      }
    } catch (_error) {
      toast.error('Failed to save progress')
    } finally {
      setCompleting(false)
    }
  }

  const renderLessonContent = () => {
    if (!lessonContent) return null

    // Parse content into sections if it contains specific markers
    const sections = lessonContent.content.split('\n\n')
    
    return (
      <div className="space-y-6">
        {sections.map((section: string, index: number) => {
          // Check if section is a code example
          if (section.startsWith('```')) {
            const code = section.replace(/```/g, '').trim()
            return (
              <div key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{code}</pre>
              </div>
            )
          }
          
          // Regular text section
          return (
            <div key={index} className="prose prose-lg dark:prose-invert max-w-none">
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
            <Card className="glass">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
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
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
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
          
          <h1 className="text-3xl font-bold mb-2">{curriculum.title}</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              Lesson {currentLessonIndex + 1} of {lessons.length}
            </p>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="w-32 h-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {completedLessons}/{lessons.length} completed
              </span>
            </div>
          </div>
        </MotionDiv>

        {/* Lesson Card */}
        {!lessonStarted ? (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{currentLesson.title}</span>
                  {currentLesson.user_progress?.status === 'completed' && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>{currentLesson.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-purple-500" />
                    <span className="capitalize">{currentLesson.difficulty_level}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span>{currentLesson.xp_reward} XP</span>
                  </div>
                </div>

                {currentLesson.user_progress?.status === 'completed' ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-green-700 dark:text-green-300">
                      ✓ You've already completed this lesson and earned {currentLesson.user_progress.xp_earned} XP!
                    </p>
                  </div>
                ) : null}

                <Button 
                  onClick={handleStartLesson}
                  className="w-full btn-premium"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {currentLesson.user_progress?.status === 'completed' ? 'Review Lesson' : 'Start Learning'}
                </Button>
              </CardContent>
            </Card>

            {/* Lesson List */}
            <Card className="glass mt-6">
              <CardHeader>
                <CardTitle>All Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIndex(index)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        index === currentLessonIndex 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">
                            {index + 1}
                          </span>
                          <span className="font-medium">{lesson.title}</span>
                        </div>
                        {lesson.user_progress?.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        ) : (
          <AnimatePresence mode="wait">
            <MotionDiv
              key="lesson-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Content */}
              <Card className="glass">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {currentLesson.duration_minutes} minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {currentLesson.xp_reward} XP
                      </span>
                    </div>
                  </div>

                  {/* Lesson Content */}
                  {renderLessonContent()}

                  {/* AI Chat Toggle Button */}
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowAiChat(!showAiChat)}
                      className="w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {showAiChat ? 'Hide AI Tutor' : 'Ask AI Tutor'}
                    </Button>
                  </div>

                  {/* Complete Button */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={handleCompleteLesson}
                      className="w-full btn-premium"
                      size="lg"
                      disabled={completing}
                    >
                      {completing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Completing...
                        </>
                      ) : (
                        <>
                          Complete Lesson
                          <Sparkles className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
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
                    lessonContext={`Learning about "${currentLesson.title}" in ${curriculum.title}`}
                    onSimplify={() => {
                      toast.success('Simplifying the content...')
                    }}
                  />
                </MotionDiv>
              )}

              {/* Tips */}
              <Card className="glass border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Learning Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Take your time - there's no rush!</li>
                    <li>• Try the examples yourself for better understanding</li>
                    <li>• Come back anytime to review this lesson</li>
                    <li>• Ask the AI tutor if something isn't clear!</li>
                  </ul>
                </CardContent>
              </Card>
            </MotionDiv>
          </AnimatePresence>
        )}
      </div>
      
      {/* Celebration Animation */}
      <Celebration show={showCelebration} />
    </div>
  )
}