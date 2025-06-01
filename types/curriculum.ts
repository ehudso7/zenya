export interface Module {
  id: string
  title: string
  description: string
  order: number
  estimatedMinutes: number
  prerequisites?: string[]
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  description: string
  order: number
  estimatedMinutes: number
  objectives: string[]
  content: LessonContent
  activities: Activity[]
  assessment?: Assessment
}

export interface LessonContent {
  introduction: string
  sections: ContentSection[]
  summary: string
  keyTakeaways: string[]
}

export interface ContentSection {
  id: string
  type: 'text' | 'video' | 'interactive' | 'example' | 'practice'
  title: string
  content: string
  mediaUrl?: string
  interactionType?: 'quiz' | 'code' | 'reflection' | 'discussion'
}

export interface Activity {
  id: string
  type: 'quiz' | 'practice' | 'reflection' | 'project'
  title: string
  instructions: string
  questions?: Question[]
  rubric?: string[]
}

export interface Question {
  id: string
  text: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'code'
  options?: string[]
  correctAnswer?: string | string[]
  explanation?: string
  hints?: string[]
}

export interface Assessment {
  id: string
  type: 'formative' | 'summative'
  passingScore: number
  questions: Question[]
  feedback: {
    pass: string
    fail: string
  }
}

export interface Progress {
  userId: string
  moduleId: string
  lessonId: string
  status: 'not-started' | 'in-progress' | 'completed'
  startedAt?: Date
  completedAt?: Date
  score?: number
  timeSpent: number
  activitiesCompleted: string[]
}

export interface Curriculum {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  estimatedHours: number
  modules: Module[]
  createdAt: Date
  updatedAt: Date
}