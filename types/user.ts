// Extended user types with all properties
import { User as BaseUser } from './index'

export interface UserProfile extends BaseUser {
  email?: string
  name?: string
  level?: number
  learning_streak?: number
  preferences?: UserPreferences
  learning_preferences?: LearningPreferences
}

export interface UserPreferences {
  soundEnabled: boolean
  animationsEnabled: boolean
  fontSize: 'small' | 'medium' | 'large'
  theme: 'system' | 'light' | 'dark'
}

export interface LearningPreferences {
  pace: 'slow' | 'medium' | 'fast'
  difficulty: 'easy' | 'medium' | 'hard'
  topics: string[]
}

// Re-export base User type
export type { User } from './index'