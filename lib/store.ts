import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Mood, Lesson, ChatMessage } from '@/types'

interface LessonSession {
  lessonId: string
  curriculumId: string
  progress: number
  startedAt: string
  lastAccessedAt: string
  messages: ChatMessage[]
}

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void
  updateMood: (mood: Mood) => void
  clearUser: () => void
  
  // Lesson state
  currentLesson: Lesson | null
  setCurrentLesson: (lesson: Lesson | null) => void
  lessonProgress: number
  setLessonProgress: (progress: number) => void
  
  // Session management
  lessonSessions: Record<string, LessonSession>
  saveSession: (lessonId: string, curriculumId: string, progress: number, messages: ChatMessage[]) => void
  getSession: (lessonId: string) => LessonSession | null
  clearSession: (lessonId: string) => void
  
  // Chat state
  messages: ChatMessage[]
  addMessage: (message: ChatMessage) => void
  clearMessages: () => void
  
  // UI state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  showCelebration: boolean
  setShowCelebration: (show: boolean) => void
  
  // Progress tracking
  dailyXP: number
  addXP: (amount: number) => void
  resetDailyXP: () => void
  lastActiveDate: string | null
  updateLastActive: () => void
  
  // Preferences
  preferences: {
    soundEnabled: boolean
    animationsEnabled: boolean
    fontSize: 'small' | 'medium' | 'large'
    theme: 'light' | 'dark' | 'system'
  }
  updatePreferences: (prefs: Partial<AppState['preferences']>) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      updateMood: (mood) => set((state) => ({
        user: state.user ? { ...state.user, mood } : null
      })),
      clearUser: () => set({ 
        user: null,
        currentLesson: null,
        lessonProgress: 0,
        messages: [],
        dailyXP: 0,
        lessonSessions: {}
      }),
      
      // Lesson state
      currentLesson: null,
      setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
      lessonProgress: 0,
      setLessonProgress: (progress) => set({ lessonProgress: progress }),
      
      // Session management
      lessonSessions: {},
      saveSession: (lessonId, curriculumId, progress, messages) => set((state) => ({
        lessonSessions: {
          ...state.lessonSessions,
          [lessonId]: {
            lessonId,
            curriculumId,
            progress,
            messages,
            startedAt: state.lessonSessions[lessonId]?.startedAt || new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
          }
        }
      })),
      getSession: (lessonId) => {
        return get().lessonSessions[lessonId] || null
      },
      clearSession: (lessonId) => set((state) => {
        const { [lessonId]: _, ...rest } = state.lessonSessions
        return { lessonSessions: rest }
      }),
      
      // Chat state
      messages: [],
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      clearMessages: () => set({ messages: [] }),
      
      // UI state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      showCelebration: false,
      setShowCelebration: (show) => set({ showCelebration: show }),
      
      // Progress tracking
      dailyXP: 0,
      addXP: (amount) => set((state) => ({
        dailyXP: state.dailyXP + amount,
        user: state.user 
          ? { ...state.user, current_xp: state.user.current_xp + amount }
          : null
      })),
      resetDailyXP: () => set({ dailyXP: 0 }),
      lastActiveDate: null,
      updateLastActive: () => set({ lastActiveDate: new Date().toISOString() }),
      
      // Preferences
      preferences: {
        soundEnabled: true,
        animationsEnabled: true,
        fontSize: 'medium',
        theme: 'system',
      },
      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
    }),
    {
      name: 'zenya-storage',
      partialize: (state) => ({
        user: state.user,
        dailyXP: state.dailyXP,
        lessonSessions: state.lessonSessions,
        lastActiveDate: state.lastActiveDate,
        preferences: state.preferences,
      }),
    }
  )
)