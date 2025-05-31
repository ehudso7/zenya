export interface User {
  id: string
  created_at: string
  last_login: string | null
  current_xp: number
  streak_count: number
  mood: Mood | null
}

export type Mood = '😴' | '😐' | '🙂' | '😄' | '🔥'

export interface Lesson {
  id: string
  title: string
  content: LessonStep[]
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface LessonStep {
  type: 'greeting' | 'topic' | 'explanation' | 'practice' | 'success' | 'reflection'
  content: string
}

export interface Session {
  id: string
  user_id: string
  lesson_id: string
  timestamp: string
  mood: Mood | null
  engagement_score: number | null
}

export interface Journal {
  id: string
  user_id: string
  lesson_id: string
  entry_text: string
  xp_earned: number
  timestamp: string
}

export interface WaitlistEntry {
  email: string
  signup_date: string
  source: string | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface AIResponse {
  message: string
  tone: 'encouraging' | 'calm' | 'energetic' | 'supportive'
  suggestions?: string[]
}