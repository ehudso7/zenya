import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Mood, Lesson, ChatMessage } from '@/types'

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void
  updateMood: (mood: Mood) => void
  
  // Lesson state
  currentLesson: Lesson | null
  setCurrentLesson: (lesson: Lesson | null) => void
  lessonProgress: number
  setLessonProgress: (progress: number) => void
  
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
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      updateMood: (mood) => set((state) => ({
        user: state.user ? { ...state.user, mood } : null
      })),
      
      // Lesson state
      currentLesson: null,
      setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
      lessonProgress: 0,
      setLessonProgress: (progress) => set({ lessonProgress: progress }),
      
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
    }),
    {
      name: 'zenya-storage',
      partialize: (state) => ({
        user: state.user,
        dailyXP: state.dailyXP,
      }),
    }
  )
)