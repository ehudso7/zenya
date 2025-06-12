/**
 * Advanced Adaptive Learning ML System for Zenya AI
 * God-Tier personalized learning with machine learning algorithms
 */

import { tracing } from '@/lib/monitoring/tracing'
import { performanceMonitor } from '@/lib/monitoring/performance'

interface LearningDataPoint {
  userId: string
  sessionId: string
  lessonId: string
  conceptId: string
  timestamp: number
  
  // Performance metrics
  timeSpent: number // milliseconds
  attemptsCount: number
  successRate: number // 0-1
  confidenceLevel: number // 0-1
  difficultyRating: number // 1-10
  
  // User state
  mood: string
  energyLevel: number // 0-1
  focusLevel: number // 0-1
  stressLevel: number // 0-1
  
  // Context
  timeOfDay: number // hour 0-23
  dayOfWeek: number // 0-6
  deviceType: 'mobile' | 'tablet' | 'desktop'
  
  // Outcomes
  completed: boolean
  comprehension: number // 0-1
  retention: number // 0-1 (measured in follow-up)
  satisfaction: number // 0-1
}

interface LearningPattern {
  userId: string
  patternType: 'optimal_time' | 'difficulty_preference' | 'learning_style' | 'concept_affinity'
  confidence: number // 0-1
  
  // Pattern data
  metadata: {
    optimalTimes?: number[] // Hours when user performs best
    preferredDifficulty?: number // 1-10
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
    strongConcepts?: string[]
    weakConcepts?: string[]
    averageSessionLength?: number
    retentionRate?: number
    progressVelocity?: number
  }
  
  lastUpdated: number
  dataPointsCount: number
}

interface AdaptiveRecommendation {
  type: 'content' | 'difficulty' | 'pacing' | 'review' | 'break' | 'style'
  priority: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  
  title: string
  description: string
  reasoning: string
  
  actionData: {
    contentId?: string
    difficultyAdjustment?: number // -3 to +3
    suggestedDuration?: number // minutes
    reviewConcepts?: string[]
    breakDuration?: number // minutes
    styleAdjustments?: Record<string, any>
  }
  
  expectedOutcome: {
    comprehensionImprovement: number // 0-1
    retentionImprovement: number // 0-1
    satisfactionImprovement: number // 0-1
    timeEfficiency: number // 0-1
  }
}

interface UserLearningProfile {
  userId: string
  createdAt: number
  lastUpdated: number
  
  // Core metrics
  overallProgress: number // 0-1
  averagePerformance: number // 0-1
  learningVelocity: number // concepts per hour
  retentionRate: number // 0-1
  
  // Preferences (learned)
  optimalDifficulty: number // 1-10
  preferredSessionLength: number // minutes
  bestLearningTimes: number[] // hours
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed'
  
  // Strengths and weaknesses
  strongAreas: Array<{
    concept: string
    proficiency: number // 0-1
    confidence: number // 0-1
  }>
  
  improvementAreas: Array<{
    concept: string
    difficulty: number // 0-1
    priority: number // 0-1
    suggestedApproach: string
  }>
  
  // Behavioral patterns
  patterns: LearningPattern[]
  
  // Personalization factors
  motivationFactors: string[]
  frustrationTriggers: string[]
  engagementPeaks: Array<{
    condition: string
    engagement: number // 0-1
  }>
}

export class AdaptiveLearningEngine {
  private learningData: Map<string, LearningDataPoint[]> = new Map()
  private userProfiles: Map<string, UserLearningProfile> = new Map()
  private patterns: Map<string, LearningPattern[]> = new Map()
  private modelWeights: Map<string, number> = new Map()
  
  // Learning algorithm configuration
  private readonly config = {
    minDataPointsForPattern: 10,
    patternConfidenceThreshold: 0.7,
    recommendationCooldown: 300000, // 5 minutes
    maxRecommendationsPerSession: 3,
    learningRateDecay: 0.95,
    
    // Feature weights for ML model
    featureWeights: {
      timeSpent: 0.2,
      successRate: 0.3,
      confidenceLevel: 0.2,
      mood: 0.1,
      timeOfDay: 0.1,
      previousPerformance: 0.1
    }
  }

  constructor() {
    this.initializeModelWeights()
    // Adaptive Learning Engine initialized
  }

  private initializeModelWeights() {
    // Initialize basic model weights
    this.modelWeights.set('difficulty_sensitivity', 0.8)
    this.modelWeights.set('time_preference', 0.6)
    this.modelWeights.set('style_preference', 0.7)
    this.modelWeights.set('retention_factor', 0.9)
    this.modelWeights.set('engagement_factor', 0.8)
  }

  // Record a learning interaction
  async recordLearningEvent(dataPoint: LearningDataPoint): Promise<void> {
    return tracing.traceOperation(
      'record_learning_event',
      async (span) => {
        span.setAttributes({
          'learning.user_id': dataPoint.userId,
          'learning.lesson_id': dataPoint.lessonId,
          'learning.concept_id': dataPoint.conceptId,
          'learning.success_rate': dataPoint.successRate,
          'learning.time_spent': dataPoint.timeSpent
        })

        // Store data point
        const userHistory = this.learningData.get(dataPoint.userId) || []
        userHistory.push(dataPoint)
        
        // Keep only recent data (last 1000 points to manage memory)
        if (userHistory.length > 1000) {
          userHistory.splice(0, userHistory.length - 1000)
        }
        
        this.learningData.set(dataPoint.userId, userHistory)

        // Update user profile asynchronously
        await this.updateUserProfile(dataPoint.userId)
        
        // Detect new patterns
        await this.detectLearningPatterns(dataPoint.userId)

        performanceMonitor.trackMetric({
          name: 'learning_event_recorded',
          value: 1,
          unit: 'count',
          metadata: {
            userId: dataPoint.userId,
            conceptId: dataPoint.conceptId,
            successRate: dataPoint.successRate
          }
        })
      }
    )
  }

  // Update user learning profile based on recent data
  private async updateUserProfile(userId: string): Promise<void> {
    const userHistory = this.learningData.get(userId) || []
    if (userHistory.length === 0) return

    let profile = this.userProfiles.get(userId)
    const now = Date.now()

    if (!profile) {
      profile = {
        userId,
        createdAt: now,
        lastUpdated: now,
        overallProgress: 0,
        averagePerformance: 0,
        learningVelocity: 0,
        retentionRate: 0,
        optimalDifficulty: 5,
        preferredSessionLength: 30,
        bestLearningTimes: [],
        learningStyle: 'mixed',
        strongAreas: [],
        improvementAreas: [],
        patterns: [],
        motivationFactors: [],
        frustrationTriggers: [],
        engagementPeaks: []
      }
    }

    // Calculate recent performance (last 30 days)
    const recentData = userHistory.filter(dp => 
      now - dp.timestamp < 30 * 24 * 60 * 60 * 1000
    )

    if (recentData.length === 0) return

    // Update core metrics
    profile.averagePerformance = this.calculateAveragePerformance(recentData)
    profile.learningVelocity = this.calculateLearningVelocity(recentData)
    profile.retentionRate = this.calculateRetentionRate(recentData)
    
    // Update preferences
    profile.optimalDifficulty = this.findOptimalDifficulty(recentData)
    profile.preferredSessionLength = this.calculatePreferredSessionLength(recentData)
    profile.bestLearningTimes = this.findBestLearningTimes(recentData)
    profile.learningStyle = this.determineLearningStyle(recentData)
    
    // Update strengths and weaknesses
    profile.strongAreas = this.identifyStrongAreas(recentData)
    profile.improvementAreas = this.identifyImprovementAreas(recentData)
    
    // Update behavioral patterns
    profile.patterns = this.patterns.get(userId) || []
    
    profile.lastUpdated = now
    this.userProfiles.set(userId, profile)
  }

  // Calculate average performance across different metrics
  private calculateAveragePerformance(data: LearningDataPoint[]): number {
    if (data.length === 0) return 0

    const weights = {
      successRate: 0.4,
      comprehension: 0.3,
      confidenceLevel: 0.2,
      satisfaction: 0.1
    }

    let weightedSum = 0
    let totalWeight = 0

    for (const point of data) {
      weightedSum += 
        point.successRate * weights.successRate +
        point.comprehension * weights.comprehension +
        point.confidenceLevel * weights.confidenceLevel +
        point.satisfaction * weights.satisfaction
      
      totalWeight += Object.values(weights).reduce((a, b) => a + b, 0)
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  // Calculate learning velocity (concepts mastered per unit time)
  private calculateLearningVelocity(data: LearningDataPoint[]): number {
    if (data.length === 0) return 0

    const masteredConcepts = new Set<string>()
    let totalTime = 0

    for (const point of data) {
      if (point.comprehension >= 0.8 && point.successRate >= 0.8) {
        masteredConcepts.add(point.conceptId)
      }
      totalTime += point.timeSpent
    }

    // Return concepts per hour
    return totalTime > 0 ? (masteredConcepts.size / (totalTime / (1000 * 60 * 60))) : 0
  }

  // Calculate retention rate
  private calculateRetentionRate(data: LearningDataPoint[]): number {
    const conceptPerformance = new Map<string, LearningDataPoint[]>()
    
    // Group by concept
    for (const point of data) {
      const existing = conceptPerformance.get(point.conceptId) || []
      existing.push(point)
      conceptPerformance.set(point.conceptId, existing)
    }

    let retentionSum = 0
    let conceptCount = 0

    // Calculate retention for each concept
    for (const [, points] of conceptPerformance) {
      if (points.length < 2) continue

      // Sort by timestamp
      points.sort((a, b) => a.timestamp - b.timestamp)
      
      // Compare first and last performance
      const first = points[0]
      const last = points[points.length - 1]
      
      if (first.comprehension > 0) {
        const retention = last.comprehension / first.comprehension
        retentionSum += Math.min(1, retention)
        conceptCount++
      }
    }

    return conceptCount > 0 ? retentionSum / conceptCount : 0
  }

  // Find optimal difficulty level for user
  private findOptimalDifficulty(data: LearningDataPoint[]): number {
    const difficultyPerformance = new Map<number, number[]>()
    
    for (const point of data) {
      const difficulty = Math.round(point.difficultyRating)
      const performance = point.successRate * point.comprehension * point.satisfaction
      
      const existing = difficultyPerformance.get(difficulty) || []
      existing.push(performance)
      difficultyPerformance.set(difficulty, existing)
    }

    let bestDifficulty = 5
    let bestPerformance = 0

    for (const [difficulty, performances] of difficultyPerformance) {
      if (performances.length >= 3) { // Need at least 3 data points
        const avgPerformance = performances.reduce((a, b) => a + b, 0) / performances.length
        
        if (avgPerformance > bestPerformance) {
          bestPerformance = avgPerformance
          bestDifficulty = difficulty
        }
      }
    }

    return bestDifficulty
  }

  // Calculate preferred session length
  private calculatePreferredSessionLength(data: LearningDataPoint[]): number {
    // Group sessions by time spent ranges
    const sessionRanges = new Map<string, number[]>()
    
    for (const point of data) {
      const minutes = Math.round(point.timeSpent / (1000 * 60))
      let range: string
      
      if (minutes <= 15) range = '0-15'
      else if (minutes <= 30) range = '16-30'
      else if (minutes <= 60) range = '31-60'
      else range = '60+'
      
      const performance = point.successRate * point.satisfaction
      const existing = sessionRanges.get(range) || []
      existing.push(performance)
      sessionRanges.set(range, existing)
    }

    // Find best performing range
    let bestRange = '16-30'
    let bestPerformance = 0

    for (const [range, performances] of sessionRanges) {
      if (performances.length >= 3) {
        const avgPerformance = performances.reduce((a, b) => a + b, 0) / performances.length
        if (avgPerformance > bestPerformance) {
          bestPerformance = avgPerformance
          bestRange = range
        }
      }
    }

    // Convert range back to minutes
    const rangeToMinutes: Record<string, number> = {
      '0-15': 15,
      '16-30': 25,
      '31-60': 45,
      '60+': 60
    }

    return rangeToMinutes[bestRange] || 30
  }

  // Find best learning times
  private findBestLearningTimes(data: LearningDataPoint[]): number[] {
    const hourPerformance = new Map<number, number[]>()
    
    for (const point of data) {
      const hour = point.timeOfDay
      const performance = point.successRate * point.comprehension
      
      const existing = hourPerformance.get(hour) || []
      existing.push(performance)
      hourPerformance.set(hour, existing)
    }

    const hourAverages: Array<{ hour: number; performance: number }> = []
    
    for (const [hour, performances] of hourPerformance) {
      if (performances.length >= 2) {
        const avgPerformance = performances.reduce((a, b) => a + b, 0) / performances.length
        hourAverages.push({ hour, performance: avgPerformance })
      }
    }

    // Sort by performance and return top 3 hours
    hourAverages.sort((a, b) => b.performance - a.performance)
    return hourAverages.slice(0, 3).map(h => h.hour)
  }

  // Determine learning style based on performance patterns
  private determineLearningStyle(_data: LearningDataPoint[]): 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed' {
    // This is simplified - in reality would analyze interaction patterns
    // For now, return mixed as we don't have detailed interaction data
    return 'mixed'
  }

  // Identify strong areas
  private identifyStrongAreas(data: LearningDataPoint[]): Array<{
    concept: string
    proficiency: number
    confidence: number
  }> {
    const conceptPerformance = new Map<string, LearningDataPoint[]>()
    
    for (const point of data) {
      const existing = conceptPerformance.get(point.conceptId) || []
      existing.push(point)
      conceptPerformance.set(point.conceptId, existing)
    }

    const strongAreas: Array<{
      concept: string
      proficiency: number
      confidence: number
    }> = []

    for (const [concept, points] of conceptPerformance) {
      if (points.length >= 3) {
        const avgProficiency = points.reduce((sum, p) => sum + p.comprehension, 0) / points.length
        const avgConfidence = points.reduce((sum, p) => sum + p.confidenceLevel, 0) / points.length
        
        if (avgProficiency >= 0.8 && avgConfidence >= 0.7) {
          strongAreas.push({
            concept,
            proficiency: avgProficiency,
            confidence: avgConfidence
          })
        }
      }
    }

    return strongAreas.sort((a, b) => b.proficiency - a.proficiency).slice(0, 5)
  }

  // Identify improvement areas
  private identifyImprovementAreas(data: LearningDataPoint[]): Array<{
    concept: string
    difficulty: number
    priority: number
    suggestedApproach: string
  }> {
    const conceptPerformance = new Map<string, LearningDataPoint[]>()
    
    for (const point of data) {
      const existing = conceptPerformance.get(point.conceptId) || []
      existing.push(point)
      conceptPerformance.set(point.conceptId, existing)
    }

    const improvementAreas: Array<{
      concept: string
      difficulty: number
      priority: number
      suggestedApproach: string
    }> = []

    for (const [concept, points] of conceptPerformance) {
      if (points.length >= 2) {
        const avgPerformance = points.reduce((sum, p) => 
          sum + (p.comprehension * p.successRate), 0
        ) / points.length
        
        const avgAttempts = points.reduce((sum, p) => sum + p.attemptsCount, 0) / points.length
        
        if (avgPerformance < 0.6 || avgAttempts > 3) {
          const difficulty = 1 - avgPerformance
          const priority = difficulty * (avgAttempts / 5) // Weight by attempts
          
          let approach = 'review'
          if (avgAttempts > 5) approach = 'simplify'
          else if (avgPerformance < 0.4) approach = 'foundational'
          else approach = 'practice'
          
          improvementAreas.push({
            concept,
            difficulty,
            priority: Math.min(1, priority),
            suggestedApproach: approach
          })
        }
      }
    }

    return improvementAreas.sort((a, b) => b.priority - a.priority).slice(0, 5)
  }

  // Detect learning patterns using ML algorithms
  private async detectLearningPatterns(userId: string): Promise<void> {
    const userHistory = this.learningData.get(userId) || []
    if (userHistory.length < this.config.minDataPointsForPattern) return

    const patterns: LearningPattern[] = []

    // Pattern 1: Optimal learning times
    const timePattern = this.detectTimePattern(userHistory)
    if (timePattern && timePattern.confidence >= this.config.patternConfidenceThreshold) {
      patterns.push(timePattern)
    }

    // Pattern 2: Difficulty preferences
    const difficultyPattern = this.detectDifficultyPattern(userHistory)
    if (difficultyPattern && difficultyPattern.confidence >= this.config.patternConfidenceThreshold) {
      patterns.push(difficultyPattern)
    }

    // Pattern 3: Concept affinities
    const conceptPattern = this.detectConceptAffinityPattern(userHistory)
    if (conceptPattern && conceptPattern.confidence >= this.config.patternConfidenceThreshold) {
      patterns.push(conceptPattern)
    }

    this.patterns.set(userId, patterns)
  }

  // Detect optimal time patterns
  private detectTimePattern(data: LearningDataPoint[]): LearningPattern | null {
    const hourPerformance = new Map<number, number[]>()
    
    for (const point of data) {
      const performance = point.successRate * point.comprehension * point.satisfaction
      const existing = hourPerformance.get(point.timeOfDay) || []
      existing.push(performance)
      hourPerformance.set(point.timeOfDay, existing)
    }

    const hourAverages: Array<{ hour: number; performance: number; count: number }> = []
    
    for (const [hour, performances] of hourPerformance) {
      if (performances.length >= 3) {
        const avgPerformance = performances.reduce((a, b) => a + b, 0) / performances.length
        hourAverages.push({ hour, performance: avgPerformance, count: performances.length })
      }
    }

    if (hourAverages.length < 3) return null

    // Calculate confidence based on performance variance and data points
    const performances = hourAverages.map(h => h.performance)
    const mean = performances.reduce((a, b) => a + b, 0) / performances.length
    const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length
    const confidence = Math.max(0, 1 - variance) * Math.min(1, hourAverages.length / 10)

    const optimalTimes = hourAverages
      .filter(h => h.performance > mean + variance)
      .map(h => h.hour)

    return {
      userId: data[0].userId,
      patternType: 'optimal_time',
      confidence,
      metadata: {
        optimalTimes
      },
      lastUpdated: Date.now(),
      dataPointsCount: data.length
    }
  }

  // Detect difficulty preference patterns
  private detectDifficultyPattern(data: LearningDataPoint[]): LearningPattern | null {
    const difficultyPerformance = new Map<number, number[]>()
    
    for (const point of data) {
      const difficulty = Math.round(point.difficultyRating)
      const performance = point.successRate * point.satisfaction
      
      const existing = difficultyPerformance.get(difficulty) || []
      existing.push(performance)
      difficultyPerformance.set(difficulty, existing)
    }

    let bestDifficulty = 5
    let bestPerformance = 0
    let confidence = 0

    for (const [difficulty, performances] of difficultyPerformance) {
      if (performances.length >= 3) {
        const avgPerformance = performances.reduce((a, b) => a + b, 0) / performances.length
        if (avgPerformance > bestPerformance) {
          bestPerformance = avgPerformance
          bestDifficulty = difficulty
          confidence = Math.min(1, performances.length / 10) * avgPerformance
        }
      }
    }

    return confidence >= this.config.patternConfidenceThreshold ? {
      userId: data[0].userId,
      patternType: 'difficulty_preference',
      confidence,
      metadata: {
        preferredDifficulty: bestDifficulty
      },
      lastUpdated: Date.now(),
      dataPointsCount: data.length
    } : null
  }

  // Detect concept affinity patterns
  private detectConceptAffinityPattern(data: LearningDataPoint[]): LearningPattern | null {
    const conceptPerformance = new Map<string, number[]>()
    
    for (const point of data) {
      const performance = point.comprehension * point.successRate
      const existing = conceptPerformance.get(point.conceptId) || []
      existing.push(performance)
      conceptPerformance.set(point.conceptId, existing)
    }

    const strongConcepts: string[] = []
    const weakConcepts: string[] = []

    for (const [concept, performances] of conceptPerformance) {
      if (performances.length >= 2) {
        const avgPerformance = performances.reduce((a, b) => a + b, 0) / performances.length
        
        if (avgPerformance >= 0.8) {
          strongConcepts.push(concept)
        } else if (avgPerformance <= 0.4) {
          weakConcepts.push(concept)
        }
      }
    }

    const totalConcepts = conceptPerformance.size
    const confidence = totalConcepts > 0 ? 
      (strongConcepts.length + weakConcepts.length) / totalConcepts : 0

    return confidence >= this.config.patternConfidenceThreshold ? {
      userId: data[0].userId,
      patternType: 'concept_affinity',
      confidence,
      metadata: {
        strongConcepts,
        weakConcepts
      },
      lastUpdated: Date.now(),
      dataPointsCount: data.length
    } : null
  }

  // Generate adaptive recommendations
  async generateRecommendations(userId: string): Promise<AdaptiveRecommendation[]> {
    return tracing.traceOperation(
      'generate_adaptive_recommendations',
      async (span) => {
        const profile = this.userProfiles.get(userId)
        const patterns = this.patterns.get(userId) || []
        const recentData = this.learningData.get(userId)?.slice(-20) || []

        span.setAttributes({
          'recommendations.user_id': userId,
          'recommendations.has_profile': !!profile,
          'recommendations.patterns_count': patterns.length,
          'recommendations.recent_data_points': recentData.length
        })

        const recommendations: AdaptiveRecommendation[] = []

        if (!profile || recentData.length === 0) {
          return recommendations
        }

        // Recommendation 1: Optimal timing
        const timeRecommendation = this.generateTimeRecommendation(profile, patterns)
        if (timeRecommendation) recommendations.push(timeRecommendation)

        // Recommendation 2: Difficulty adjustment
        const difficultyRecommendation = this.generateDifficultyRecommendation(profile, recentData)
        if (difficultyRecommendation) recommendations.push(difficultyRecommendation)

        // Recommendation 3: Content recommendations
        const contentRecommendation = this.generateContentRecommendation(profile, recentData)
        if (contentRecommendation) recommendations.push(contentRecommendation)

        // Recommendation 4: Review recommendations
        const reviewRecommendation = this.generateReviewRecommendation(profile, recentData)
        if (reviewRecommendation) recommendations.push(reviewRecommendation)

        // Sort by priority and confidence
        recommendations.sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          const aPriority = priorityOrder[a.priority]
          const bPriority = priorityOrder[b.priority]
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority
          }
          
          return b.confidence - a.confidence
        })

        span.setAttributes({
          'recommendations.generated_count': recommendations.length,
          'recommendations.high_priority_count': recommendations.filter(r => r.priority === 'high').length
        })

        return recommendations.slice(0, this.config.maxRecommendationsPerSession)
      }
    )
  }

  // Generate time-based recommendations
  private generateTimeRecommendation(
    profile: UserLearningProfile, 
    patterns: LearningPattern[]
  ): AdaptiveRecommendation | null {
    const timePattern = patterns.find(p => p.patternType === 'optimal_time')
    if (!timePattern || !timePattern.metadata.optimalTimes) return null

    const currentHour = new Date().getHours()
    const optimalTimes = timePattern.metadata.optimalTimes
    const isOptimalTime = optimalTimes.includes(currentHour)

    if (!isOptimalTime && optimalTimes.length > 0) {
      const nextOptimalTime = optimalTimes.find(time => time > currentHour) || optimalTimes[0]
      
      return {
        type: 'pacing',
        priority: 'medium',
        confidence: timePattern.confidence,
        title: 'Optimize your learning schedule',
        description: `Your peak learning time is at ${nextOptimalTime}:00. Consider scheduling your next session then.`,
        reasoning: `Based on your performance data, you learn ${Math.round(timePattern.confidence * 100)}% better during your optimal hours.`,
        actionData: {
          suggestedDuration: profile.preferredSessionLength
        },
        expectedOutcome: {
          comprehensionImprovement: timePattern.confidence * 0.3,
          retentionImprovement: timePattern.confidence * 0.2,
          satisfactionImprovement: timePattern.confidence * 0.25,
          timeEfficiency: timePattern.confidence * 0.4
        }
      }
    }

    return null
  }

  // Generate difficulty adjustment recommendations
  private generateDifficultyRecommendation(
    profile: UserLearningProfile,
    recentData: LearningDataPoint[]
  ): AdaptiveRecommendation | null {
    if (recentData.length < 3) return null

    const recentPerformance = recentData.slice(-5)
    const avgSuccessRate = recentPerformance.reduce((sum, p) => sum + p.successRate, 0) / recentPerformance.length
    const avgConfidence = recentPerformance.reduce((sum, p) => sum + p.confidenceLevel, 0) / recentPerformance.length

    let adjustment = 0
    let priority: 'low' | 'medium' | 'high' = 'medium'
    let title = ''
    let description = ''

    if (avgSuccessRate < 0.4 && avgConfidence < 0.5) {
      adjustment = -2
      priority = 'high'
      title = 'Simplify the content'
      description = 'Recent struggles suggest the material may be too challenging. Let\'s dial it back a bit.'
    } else if (avgSuccessRate > 0.9 && avgConfidence > 0.8) {
      adjustment = +1
      priority = 'medium'
      title = 'Ready for more challenge'
      description = 'You\'re mastering this level! Time to step up the difficulty.'
    } else if (avgSuccessRate < 0.6) {
      adjustment = -1
      priority = 'medium'
      title = 'Slight difficulty adjustment'
      description = 'A small reduction in difficulty could improve your learning flow.'
    }

    if (adjustment === 0) return null

    return {
      type: 'difficulty',
      priority,
      confidence: Math.min(1, recentPerformance.length / 5),
      title,
      description,
      reasoning: `Your recent success rate is ${Math.round(avgSuccessRate * 100)}% and confidence is ${Math.round(avgConfidence * 100)}%.`,
      actionData: {
        difficultyAdjustment: adjustment
      },
      expectedOutcome: {
        comprehensionImprovement: Math.abs(adjustment) * 0.2,
        retentionImprovement: Math.abs(adjustment) * 0.15,
        satisfactionImprovement: Math.abs(adjustment) * 0.3,
        timeEfficiency: Math.abs(adjustment) * 0.1
      }
    }
  }

  // Generate content recommendations
  private generateContentRecommendation(
    profile: UserLearningProfile,
    _recentData: LearningDataPoint[]
  ): AdaptiveRecommendation | null {
    if (profile.strongAreas.length === 0 && profile.improvementAreas.length === 0) return null

    // Recommend building on strengths or addressing weaknesses
    if (profile.improvementAreas.length > 0 && Math.random() < 0.7) {
      const topWeakness = profile.improvementAreas[0]
      
      return {
        type: 'content',
        priority: topWeakness.priority > 0.7 ? 'high' : 'medium',
        confidence: topWeakness.priority,
        title: `Focus on ${topWeakness.concept}`,
        description: `This concept needs attention. Let's use a ${topWeakness.suggestedApproach} approach.`,
        reasoning: `You've had difficulty with this concept, with a ${Math.round(topWeakness.difficulty * 100)}% difficulty rating.`,
        actionData: {
          contentId: topWeakness.concept
        },
        expectedOutcome: {
          comprehensionImprovement: 0.4,
          retentionImprovement: 0.3,
          satisfactionImprovement: 0.2,
          timeEfficiency: 0.25
        }
      }
    } else if (profile.strongAreas.length > 0) {
      const topStrength = profile.strongAreas[0]
      
      return {
        type: 'content',
        priority: 'medium',
        confidence: topStrength.confidence,
        title: `Build on your ${topStrength.concept} strength`,
        description: 'You excel at this concept! Let\'s explore advanced applications.',
        reasoning: `You have ${Math.round(topStrength.proficiency * 100)}% proficiency in this area.`,
        actionData: {
          contentId: topStrength.concept,
          difficultyAdjustment: +1
        },
        expectedOutcome: {
          comprehensionImprovement: 0.3,
          retentionImprovement: 0.4,
          satisfactionImprovement: 0.4,
          timeEfficiency: 0.3
        }
      }
    }

    return null
  }

  // Generate review recommendations
  private generateReviewRecommendation(
    profile: UserLearningProfile,
    recentData: LearningDataPoint[]
  ): AdaptiveRecommendation | null {
    // Check if user hasn't reviewed concepts for a while
    const conceptLastSeen = new Map<string, number>()
    
    for (const point of recentData) {
      const lastSeen = conceptLastSeen.get(point.conceptId) || 0
      if (point.timestamp > lastSeen) {
        conceptLastSeen.set(point.conceptId, point.timestamp)
      }
    }

    const now = Date.now()
    const reviewCandidates: string[] = []

    for (const [concept, lastSeen] of conceptLastSeen) {
      const daysSinceLastSeen = (now - lastSeen) / (1000 * 60 * 60 * 24)
      
      // Recommend review if not seen for 3+ days and was previously learned
      if (daysSinceLastSeen >= 3) {
        reviewCandidates.push(concept)
      }
    }

    if (reviewCandidates.length === 0) return null

    return {
      type: 'review',
      priority: 'medium',
      confidence: Math.min(1, reviewCandidates.length / 3),
      title: 'Time for a review session',
      description: `You haven't practiced ${reviewCandidates.length} concept(s) recently. Let's refresh your memory.`,
      reasoning: 'Spaced repetition helps improve long-term retention.',
      actionData: {
        reviewConcepts: reviewCandidates.slice(0, 3),
        suggestedDuration: 15
      },
      expectedOutcome: {
        comprehensionImprovement: 0.1,
        retentionImprovement: 0.5,
        satisfactionImprovement: 0.2,
        timeEfficiency: 0.3
      }
    }
  }

  // Get user learning profile
  getUserProfile(userId: string): UserLearningProfile | null {
    return this.userProfiles.get(userId) || null
  }

  // Get learning analytics
  getLearningAnalytics(userId: string): {
    totalSessions: number
    totalTime: number
    averageSessionLength: number
    conceptsMastered: number
    currentStreak: number
    overallProgress: number
  } {
    const userHistory = this.learningData.get(userId) || []
    const profile = this.userProfiles.get(userId)

    if (userHistory.length === 0) {
      return {
        totalSessions: 0,
        totalTime: 0,
        averageSessionLength: 0,
        conceptsMastered: 0,
        currentStreak: 0,
        overallProgress: 0
      }
    }

    // Group by session (assuming gap > 1 hour means new session)
    const sessions: LearningDataPoint[][] = []
    let currentSession: LearningDataPoint[] = [userHistory[0]]

    for (let i = 1; i < userHistory.length; i++) {
      const timeDiff = userHistory[i].timestamp - userHistory[i-1].timestamp
      
      if (timeDiff > 60 * 60 * 1000) { // 1 hour gap
        sessions.push(currentSession)
        currentSession = [userHistory[i]]
      } else {
        currentSession.push(userHistory[i])
      }
    }
    
    if (currentSession.length > 0) {
      sessions.push(currentSession)
    }

    // Calculate metrics
    const totalTime = userHistory.reduce((sum, p) => sum + p.timeSpent, 0)
    const averageSessionLength = sessions.length > 0 ? 
      totalTime / sessions.length : 0

    // Count mastered concepts (>= 80% comprehension in latest attempt)
    const conceptComprehension = new Map<string, number>()
    for (const point of userHistory) {
      conceptComprehension.set(point.conceptId, point.comprehension)
    }
    
    const conceptsMastered = Array.from(conceptComprehension.values())
      .filter(comprehension => comprehension >= 0.8).length

    // Calculate current streak (consecutive days with learning)
    const today = new Date()
    let currentStreak = 0
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      checkDate.setHours(0, 0, 0, 0)
      
      const hasActivityOnDay = userHistory.some(point => {
        const pointDate = new Date(point.timestamp)
        pointDate.setHours(0, 0, 0, 0)
        return pointDate.getTime() === checkDate.getTime()
      })
      
      if (hasActivityOnDay) {
        currentStreak++
      } else if (i > 0) { // Don't break on first day (today) if no activity yet
        break
      }
    }

    return {
      totalSessions: sessions.length,
      totalTime,
      averageSessionLength,
      conceptsMastered,
      currentStreak,
      overallProgress: profile?.overallProgress || 0
    }
  }

  // Get system statistics
  getSystemStats() {
    return {
      totalUsers: this.userProfiles.size,
      totalDataPoints: Array.from(this.learningData.values())
        .reduce((sum, data) => sum + data.length, 0),
      totalPatterns: Array.from(this.patterns.values())
        .reduce((sum, patterns) => sum + patterns.length, 0),
      modelWeights: Object.fromEntries(this.modelWeights)
    }
  }
}

// Export singleton instance
export const adaptiveLearning = new AdaptiveLearningEngine()