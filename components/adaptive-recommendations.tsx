'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, Clock, Target, BookOpen, RotateCcw, Lightbulb, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

interface AdaptiveRecommendation {
  type: 'content' | 'difficulty' | 'pacing' | 'review' | 'break' | 'style'
  priority: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  
  title: string
  description: string
  reasoning: string
  
  actionData: {
    contentId?: string
    difficultyAdjustment?: number
    suggestedDuration?: number
    reviewConcepts?: string[]
    breakDuration?: number
    styleAdjustments?: Record<string, any>
  }
  
  expectedOutcome: {
    comprehensionImprovement: number
    retentionImprovement: number
    satisfactionImprovement: number
    timeEfficiency: number
  }
}

interface LearningProfile {
  overallProgress: number
  learningVelocity: number
  retentionRate: number
  optimalDifficulty: number
  preferredSessionLength: number
}

interface LearningAnalytics {
  totalSessions: number
  totalTime: number
  averageSessionLength: number
  conceptsMastered: number
  currentStreak: number
  overallProgress: number
}

interface AdaptiveRecommendationsProps {
  lessonId?: string
  onApplyRecommendation?: (recommendation: AdaptiveRecommendation) => void
  className?: string
}

export function AdaptiveRecommendations({ 
  lessonId, 
  onApplyRecommendation,
  className 
}: AdaptiveRecommendationsProps) {
  const { user } = useStore()
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([])
  const [profile, setProfile] = useState<LearningProfile | null>(null)
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      loadAdaptiveData()
    }
  }, [user])

  const loadAdaptiveData = async () => {
    try {
      setIsLoading(true)
      
      const data = await api.get<{
        recommendations: AdaptiveRecommendation[]
        profile: LearningProfile
        analytics: LearningAnalytics
      }>('/api/adaptive-learning?recommendations=true&profile=true&analytics=true')
      
      setRecommendations(data.recommendations || [])
      setProfile(data.profile)
      setAnalytics(data.analytics)
      
    } catch (error) {
      console.error('Failed to load adaptive data:', error)
      toast.error('Failed to load personalized recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  const recordLearningEvent = async (eventData: {
    conceptId: string
    timeSpent: number
    successRate: number
    comprehension: number
    completed: boolean
  }) => {
    try {
      const sessionId = `session_${Date.now()}`
      
      await api.post('/api/adaptive-learning', {
        sessionId,
        lessonId: lessonId || 'general',
        conceptId: eventData.conceptId,
        timeSpent: eventData.timeSpent,
        attemptsCount: 1,
        successRate: eventData.successRate,
        confidenceLevel: eventData.comprehension,
        difficultyRating: profile?.optimalDifficulty || 5,
        mood: user?.mood || 'focused',
        energyLevel: 0.7,
        focusLevel: 0.8,
        stressLevel: 0.3,
        deviceType: 'desktop',
        completed: eventData.completed,
        comprehension: eventData.comprehension,
        retention: 0.8,
        satisfaction: 0.8
      })
      
      // Reload recommendations after recording event
      await loadAdaptiveData()
      
    } catch (error) {
      console.error('Failed to record learning event:', error)
    }
  }

  const applyRecommendation = (recommendation: AdaptiveRecommendation) => {
    const recommendationId = `${recommendation.type}_${recommendation.title.replace(/\s+/g, '_')}`
    
    setAppliedRecommendations(prev => new Set([...prev, recommendationId]))
    
    if (onApplyRecommendation) {
      onApplyRecommendation(recommendation)
    }
    
    // Show success message
    toast.success(`Applied: ${recommendation.title}`)
    
    // Record the application as a learning event
    recordLearningEvent({
      conceptId: recommendation.actionData.contentId || 'recommendation_applied',
      timeSpent: 1000, // 1 second for applying recommendation
      successRate: 1.0,
      comprehension: 0.8,
      completed: true
    })
  }

  const getPriorityIcon = (priority: AdaptiveRecommendation['priority']) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'high':
        return <Target className="w-4 h-4 text-orange-500" />
      case 'medium':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />
      case 'low':
        return <BookOpen className="w-4 h-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: AdaptiveRecommendation['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
    }
  }

  const getTypeIcon = (type: AdaptiveRecommendation['type']) => {
    switch (type) {
      case 'content': return <BookOpen className="w-4 h-4" />
      case 'difficulty': return <TrendingUp className="w-4 h-4" />
      case 'pacing': return <Clock className="w-4 h-4" />
      case 'review': return <RotateCcw className="w-4 h-4" />
      case 'break': return <Clock className="w-4 h-4" />
      case 'style': return <Brain className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <Card className={`glass ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Brain className="w-6 h-6 animate-pulse text-blue-500 mr-2" />
            <span>Analyzing your learning patterns...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Learning Analytics Overview */}
      {analytics && (
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Your Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.currentStreak}
                </div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.conceptsMastered}
                </div>
                <div className="text-sm text-gray-500">Concepts Mastered</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(analytics.averageSessionLength / (1000 * 60))}m
                </div>
                <div className="text-sm text-gray-500">Avg Session</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(analytics.overallProgress * 100)}%
                </div>
                <div className="text-sm text-gray-500">Progress</div>
              </div>
            </div>
            
            {profile && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Learning Velocity</span>
                  <span>{profile.learningVelocity.toFixed(2)} concepts/hour</span>
                </div>
                <Progress value={profile.learningVelocity * 20} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Retention Rate</span>
                  <span>{Math.round(profile.retentionRate * 100)}%</span>
                </div>
                <Progress value={profile.retentionRate * 100} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Adaptive Recommendations */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Personalized Recommendations
            {recommendations.length > 0 && (
              <Badge variant="secondary">{recommendations.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recommendations yet.</p>
              <p className="text-sm">Complete more lessons to get personalized suggestions!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => {
                const recommendationId = `${recommendation.type}_${recommendation.title.replace(/\s+/g, '_')}`
                const isApplied = appliedRecommendations.has(recommendationId)
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-all ${
                      isApplied 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(recommendation.type)}
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <Badge variant={getPriorityColor(recommendation.priority)} className="text-xs">
                            {recommendation.priority}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            {getPriorityIcon(recommendation.priority)}
                            {Math.round(recommendation.confidence * 100)}% confidence
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {recommendation.description}
                        </p>
                        
                        <p className="text-xs text-gray-500 mb-3">
                          {recommendation.reasoning}
                        </p>
                        
                        {/* Expected Outcomes */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="flex flex-col">
                            <span className="text-gray-500">Comprehension</span>
                            <span className="font-medium text-blue-600">
                              +{Math.round(recommendation.expectedOutcome.comprehensionImprovement * 100)}%
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Retention</span>
                            <span className="font-medium text-green-600">
                              +{Math.round(recommendation.expectedOutcome.retentionImprovement * 100)}%
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Satisfaction</span>
                            <span className="font-medium text-purple-600">
                              +{Math.round(recommendation.expectedOutcome.satisfactionImprovement * 100)}%
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Efficiency</span>
                            <span className="font-medium text-orange-600">
                              +{Math.round(recommendation.expectedOutcome.timeEfficiency * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Button
                          onClick={() => applyRecommendation(recommendation)}
                          disabled={isApplied}
                          size="sm"
                          variant={isApplied ? 'secondary' : 'default'}
                        >
                          {isApplied ? '✓ Applied' : 'Apply'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Learning Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => recordLearningEvent({
                conceptId: 'quick_review',
                timeSpent: 300000, // 5 minutes
                successRate: 0.8,
                comprehension: 0.7,
                completed: true
              })}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Quick Review
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => recordLearningEvent({
                conceptId: 'practice_session',
                timeSpent: 600000, // 10 minutes
                successRate: 0.9,
                comprehension: 0.8,
                completed: true
              })}
            >
              <Target className="w-4 h-4 mr-1" />
              Practice
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadAdaptiveData}
            >
              <Brain className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}