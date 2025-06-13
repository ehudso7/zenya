/**
 * Adaptive Learning System
 * Personalizes learning paths based on user behavior and content metadata
 */

import { createClient } from '@/lib/supabase/client'
import { ZenyaOpenAIProvider } from './zenya-openai-provider'
import type { UserContext } from './zenya-model-config'

export interface LearningProfile {
  userId: string
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  preferredDifficulty: number
  strongTopics: string[]
  weakTopics: string[]
  avgSessionTime: number
  completionRate: number
  lastUpdated: Date
}

export interface AdaptiveRecommendation {
  lessonId: string
  curriculumId: string
  reason: string
  difficulty: number
  estimatedTime: number
  matchScore: number
  alternativeFormats?: string[]
}

export class AdaptiveLearningEngine {
  private provider: ZenyaOpenAIProvider
  private supabase = createClient()

  constructor() {
    this.provider = new ZenyaOpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  /**
   * Generate personalized recommendations based on user progress
   */
  async generateRecommendations(
    userId: string,
    context?: {
      recentLesson?: string
      performance?: 'struggled' | 'completed' | 'excelled'
      timeOfDay?: string
      mood?: string
    }
  ): Promise<AdaptiveRecommendation[]> {
    try {
      // Get user learning profile
      const profile = await this.getUserLearningProfile(userId)
      
      // Get recent progress data
      const recentProgress = await this.getRecentProgress(userId)
      
      // Get available content
      const availableContent = await this.getAvailableContent(userId)
      
      // Create user context for model selection
      const userContext: UserContext = {
        id: userId,
        usageScore: profile.completionRate * 100,
        segment: profile.completionRate > 0.8 ? 'power-user' : 'regular',
        persona: 'zenya'
      }
      
      // Generate adaptive recommendations using AI
      const systemPrompt = this.buildAdaptiveSystemPrompt(profile, recentProgress)
      const userPrompt = this.buildUserPrompt(context, availableContent)
      
      const response = await this.provider.chat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        {
          user: userContext,
          variant: 'zenya-chat',
          temperature: 0.7,
          maxTokens: 500
        }
      )
      
      // Parse AI response into recommendations
      return this.parseRecommendations(response, availableContent)
    } catch (error) {
      console.error('Failed to generate adaptive recommendations:', error)
      return this.getFallbackRecommendations(userId)
    }
  }

  /**
   * Update user learning profile based on interactions
   */
  async updateLearningProfile(
    userId: string,
    interaction: {
      lessonId: string
      completionTime: number
      score?: number
      struggledWith?: string[]
      preferredFormat?: string
    }
  ): Promise<void> {
    try {
      const profile = await this.getUserLearningProfile(userId)
      
      // Update profile metrics
      const updatedProfile = {
        ...profile,
        avgSessionTime: this.updateAverage(
          profile.avgSessionTime,
          interaction.completionTime
        ),
        lastUpdated: new Date()
      }
      
      // Update topic strengths/weaknesses
      if (interaction.score) {
        if (interaction.score >= 80) {
          // Add to strong topics
          const lessonTopic = await this.getLessonTopic(interaction.lessonId)
          if (lessonTopic && !updatedProfile.strongTopics.includes(lessonTopic)) {
            updatedProfile.strongTopics.push(lessonTopic)
          }
        } else if (interaction.score < 60 && interaction.struggledWith) {
          // Add to weak topics
          updatedProfile.weakTopics = [
            ...new Set([...updatedProfile.weakTopics, ...interaction.struggledWith])
          ]
        }
      }
      
      // Save updated profile
      await this.saveUserProfile(userId, updatedProfile)
      
      // Log for analytics
      await this.logProfileUpdate(userId, updatedProfile, interaction)
    } catch (error) {
      console.error('Failed to update learning profile:', error)
    }
  }

  /**
   * Detect user learning style based on behavior patterns
   */
  async detectLearningStyle(userId: string): Promise<string> {
    try {
      const interactions = await this.getUserInteractions(userId, 20)
      
      const patterns = {
        visual: 0,
        auditory: 0,
        kinesthetic: 0,
        reading: 0
      }
      
      // Analyze interaction patterns
      for (const interaction of interactions) {
        if (interaction.content_type?.includes('video')) patterns.visual += 2
        if (interaction.content_type?.includes('image')) patterns.visual += 1
        if (interaction.content_type?.includes('audio')) patterns.auditory += 2
        if (interaction.content_type?.includes('podcast')) patterns.auditory += 1
        if (interaction.content_type?.includes('interactive')) patterns.kinesthetic += 2
        if (interaction.content_type?.includes('exercise')) patterns.kinesthetic += 1
        if (interaction.content_type?.includes('text')) patterns.reading += 1
        if (interaction.reading_time > interaction.avg_reading_time) patterns.reading += 1
      }
      
      // Return dominant style
      return Object.entries(patterns)
        .sort(([, a], [, b]) => b - a)[0][0] as LearningProfile['learningStyle']
    } catch (error) {
      console.error('Failed to detect learning style:', error)
      return 'visual' // Default fallback
    }
  }

  /**
   * Generate dataset for fine-tuning adaptive learning model
   */
  async generateFineTuningDataset(): Promise<any[]> {
    const dataset = []
    
    // Get successful learning paths
    const { data: successfulPaths } = await this.supabase
      .from('learning_sessions')
      .select('*')
      .gte('engagement_score', 8)
      .limit(1000)
    
    if (successfulPaths) {
      for (const path of successfulPaths) {
        const example = {
          messages: [
            {
              role: 'system',
              content: 'You are Zenya, an adaptive learning assistant that personalizes learning paths.'
            },
            {
              role: 'user',
              content: `User struggled with ${path.struggled_topics}. They prefer ${path.preferred_style} content. What should they study next?`
            },
            {
              role: 'assistant',
              content: this.generateIdealResponse(path)
            }
          ]
        }
        dataset.push(example)
      }
    }
    
    return dataset
  }

  // Private helper methods
  private async getUserLearningProfile(userId: string): Promise<LearningProfile> {
    const { data } = await this.supabase
      .from('user_learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (data) return data
    
    // Create default profile
    return {
      userId,
      learningStyle: 'visual',
      preferredDifficulty: 5,
      strongTopics: [],
      weakTopics: [],
      avgSessionTime: 15,
      completionRate: 0,
      lastUpdated: new Date()
    }
  }

  private async getRecentProgress(userId: string) {
    const { data } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    return data || []
  }

  private async getAvailableContent(_userId: string) {
    const { data } = await this.supabase
      .from('curriculums')
      .select('*, lessons(*)')
      .eq('is_published', true)
    
    return data || []
  }

  private buildAdaptiveSystemPrompt(
    profile: LearningProfile,
    recentProgress: any[]
  ): string {
    return `You are Zenya, an adaptive learning assistant. You personalize learning paths based on:
    
User Profile:
- Learning Style: ${profile.learningStyle}
- Preferred Difficulty: ${profile.preferredDifficulty}/10
- Strong Topics: ${profile.strongTopics.join(', ') || 'None identified yet'}
- Areas for Improvement: ${profile.weakTopics.join(', ') || 'None identified yet'}
- Average Session Time: ${profile.avgSessionTime} minutes
- Completion Rate: ${(profile.completionRate * 100).toFixed(1)}%

Recent Progress:
${recentProgress.map(p => `- ${p.lesson_title}: ${p.score}% (${p.time_spent}min)`).join('\n')}

Your task is to recommend the next best lessons that:
1. Match their learning style
2. Address weak areas while building on strengths
3. Maintain appropriate difficulty progression
4. Fit within their typical session time
5. Keep them engaged and motivated`
  }

  private buildUserPrompt(context: any, content: any[]): string {
    let prompt = 'Based on the user profile and available content, recommend the next 3-5 lessons.\n\n'
    
    if (context?.recentLesson) {
      prompt += `They just ${context.performance} "${context.recentLesson}".\n`
    }
    
    if (context?.mood) {
      prompt += `Current mood: ${context.mood}\n`
    }
    
    if (context?.timeOfDay) {
      prompt += `Time of day: ${context.timeOfDay}\n`
    }
    
    prompt += '\nAvailable content:\n'
    prompt += content.map(c => `- ${c.title}: ${c.description} (${c.lessons?.length} lessons)`).join('\n')
    
    return prompt
  }

  private parseRecommendations(
    aiResponse: string,
    availableContent: any[]
  ): AdaptiveRecommendation[] {
    // Parse AI response and match to actual content
    const recommendations: AdaptiveRecommendation[] = []
    
    // Simple parsing logic - in production, use more robust parsing
    const lines = aiResponse.split('\n')
    for (const line of lines) {
      if (line.includes('Lesson:') || line.includes('Recommend:')) {
        // Extract lesson information and match to available content
        // This is simplified - implement proper parsing based on AI response format
        const lesson = availableContent[0]?.lessons?.[0]
        if (lesson) {
          recommendations.push({
            lessonId: lesson.id,
            curriculumId: availableContent[0].id,
            reason: 'Matched based on learning profile',
            difficulty: lesson.difficulty || 5,
            estimatedTime: lesson.estimated_time || 15,
            matchScore: 0.85,
            alternativeFormats: ['video', 'text', 'interactive']
          })
        }
      }
    }
    
    return recommendations.slice(0, 5)
  }

  private async getFallbackRecommendations(_userId: string): Promise<AdaptiveRecommendation[]> {
    // Simple fallback logic
    const { data: lessons } = await this.supabase
      .from('lessons')
      .select('*')
      .eq('is_published', true)
      .order('difficulty', { ascending: true })
      .limit(3)
    
    return (lessons || []).map((lesson: any) => ({
      lessonId: lesson.id,
      curriculumId: lesson.curriculum_id,
      reason: 'Popular lesson for beginners',
      difficulty: lesson.difficulty || 5,
      estimatedTime: lesson.estimated_time || 15,
      matchScore: 0.5,
      alternativeFormats: ['text']
    }))
  }

  private updateAverage(current: number, newValue: number): number {
    return (current + newValue) / 2
  }

  private async getLessonTopic(lessonId: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('lessons')
      .select('topic')
      .eq('id', lessonId)
      .single()
    
    return data?.topic || null
  }

  private async saveUserProfile(userId: string, profile: LearningProfile): Promise<void> {
    await this.supabase
      .from('user_learning_profiles')
      .upsert({
        user_id: userId,
        ...profile
      })
  }

  private async getUserInteractions(userId: string, limit: number) {
    const { data } = await this.supabase
      .from('ai_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return data || []
  }

  private async logProfileUpdate(
    userId: string,
    profile: LearningProfile,
    interaction: any
  ): Promise<void> {
    await this.supabase
      .from('adaptive_learning_logs')
      .insert({
        user_id: userId,
        profile_snapshot: profile,
        interaction_data: interaction,
        timestamp: new Date().toISOString()
      })
  }

  private generateIdealResponse(path: any): string {
    return `Based on your struggle with ${path.struggled_topics}, I recommend:
1. Review the fundamentals with our visual guide
2. Practice with interactive exercises (10-15 minutes)
3. Apply concepts in a mini-project
This approach matches your ${path.preferred_style} learning style.`
  }
}

// Export singleton instance
export const adaptiveLearning = new AdaptiveLearningEngine()