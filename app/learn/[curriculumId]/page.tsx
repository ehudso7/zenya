'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  CheckCircle, 
  Clock, 
  Target,
  BookOpen,
  Trophy,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import AppNavigation from '@/components/app-navigation'
import { toast } from 'react-hot-toast'
import { webDevBasicsCurriculum } from '@/lib/curriculum/web-dev-basics'
import type { Lesson, Module, Activity } from '@/types/curriculum'

interface Props {
  params: Promise<{ curriculumId: string }>
}

export default function CurriculumPage({ params }: Props) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [lessonStarted, setLessonStarted] = useState(false)
  const [completedSections, setCompletedSections] = useState<string[]>([])
  const [showAssessment, setShowAssessment] = useState(false)
  
  // For now, we'll use the web dev curriculum
  const curriculum = webDevBasicsCurriculum
  const currentModule = curriculum.modules[currentModuleIndex]
  const currentLesson = currentModule?.lessons[currentLessonIndex]
  const currentSection = currentLesson?.content.sections[currentSectionIndex]
  
  const totalSections = currentLesson?.content.sections.length || 0
  const progress = totalSections > 0 ? (currentSectionIndex / totalSections) * 100 : 0

  const handleStartLesson = () => {
    setLessonStarted(true)
    toast.success(`Starting: ${currentLesson.title}`)
  }

  const handleNextSection = () => {
    if (currentSection) {
      setCompletedSections([...completedSections, currentSection.id])
    }

    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    } else if (currentLesson?.assessment) {
      setShowAssessment(true)
    } else {
      handleCompleteLesson()
    }
  }

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const handleCompleteLesson = () => {
    toast.success('🎉 Lesson completed! Great work!')
    
    // Move to next lesson
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1)
      setCurrentSectionIndex(0)
      setLessonStarted(false)
      setCompletedSections([])
    } else if (currentModuleIndex < curriculum.modules.length - 1) {
      // Move to next module
      setCurrentModuleIndex(currentModuleIndex + 1)
      setCurrentLessonIndex(0)
      setCurrentSectionIndex(0)
      setLessonStarted(false)
      setCompletedSections([])
      toast.success('🏆 Module completed! Moving to the next one.')
    } else {
      // Curriculum completed!
      toast.success('🎓 Congratulations! You\'ve completed the entire curriculum!')
      router.push('/progress')
    }
  }

  const renderSection = () => {
    if (!currentSection) return null

    switch (currentSection.type) {
      case 'text':
        return (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-4">{currentSection.title}</h3>
            <p className="whitespace-pre-line">{currentSection.content}</p>
          </div>
        )
      
      case 'example':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{currentSection.title}</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{currentSection.content}</pre>
            </div>
          </div>
        )
      
      case 'interactive':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{currentSection.title}</h3>
            <p>{currentSection.content}</p>
            <Card className="glass">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    Interactive component coming soon!
                  </p>
                  <Button className="mt-4" onClick={handleNextSection}>
                    Continue for now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      default:
        return <p>{currentSection.content}</p>
    }
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <Card className="glass p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-center">Curriculum not found</p>
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
        <motion.div
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
          <p className="text-gray-600 dark:text-gray-400">
            Module {currentModuleIndex + 1} of {curriculum.modules.length}: {currentModule.title}
          </p>
        </motion.div>

        {/* Lesson Card */}
        {!lessonStarted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{currentLesson.title}</span>
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    Lesson {currentLessonIndex + 1} of {currentModule.lessons.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg">{currentLesson.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>{currentLesson.estimatedMinutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-green-500" />
                    <span>{currentLesson.objectives.length} learning objectives</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">What you'll learn:</h4>
                  <ul className="space-y-2">
                    {currentLesson.objectives.map((objective, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  onClick={handleStartLesson}
                  className="w-full btn-premium"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSectionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Section {currentSectionIndex + 1} of {totalSections}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Content */}
              <Card className="glass">
                <CardContent className="p-8">
                  {/* Introduction */}
                  {currentSectionIndex === 0 && (
                    <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                      <p className="text-lg">{currentLesson.content.introduction}</p>
                    </div>
                  )}

                  {/* Section Content */}
                  {renderSection()}

                  {/* Navigation */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="secondary"
                      onClick={handlePreviousSection}
                      disabled={currentSectionIndex === 0}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    
                    <Button
                      onClick={handleNextSection}
                      className="btn-primary"
                    >
                      {currentSectionIndex === totalSections - 1 ? (
                        <>
                          Complete Lesson
                          <Trophy className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Key Takeaways (shown on last section) */}
              {currentSectionIndex === totalSections - 1 && (
                <Card className="glass border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="text-green-700 dark:text-green-300">
                      Key Takeaways
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {currentLesson.content.keyTakeaways.map((takeaway, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}