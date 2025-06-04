import { z } from 'zod'

// Common schemas
export const emailSchema = z.string().email('Invalid email address').toLowerCase()

export const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password is too long')

export const moodSchema = z.enum(['😴', '😐', '🙂', '😄', '🔥']).nullable()

// Auth schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Waitlist schema
export const waitlistSchema = z.object({
  email: emailSchema,
  reason: z.string().optional(),
})

// AI request schema
export const aiRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(1000, 'Message is too long'),
  mood: moodSchema,
  context: z.string().max(500).optional(),
})

// Lesson progress schema
export const lessonProgressSchema = z.object({
  timeSpent: z.number()
    .min(0)
    .max(7200), // Max 2 hours
  mood: moodSchema,
  completed: z.boolean(),
})

// Profile update schema
export const profileUpdateSchema = z.object({
  display_name: z.string()
    .min(1, 'Display name is required')
    .max(50, 'Display name is too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Display name contains invalid characters')
    .optional(),
  bio: z.string()
    .max(500, 'Bio is too long')
    .optional(),
  learning_style: z.enum(['visual', 'auditory', 'reading', 'kinesthetic'])
    .optional(),
  preferred_topics: z.array(z.string()).max(10).optional(),
  timezone: z.string().optional(),
  notification_preferences: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    streak_reminders: z.boolean().optional(),
    achievement_alerts: z.boolean().optional(),
  }).optional(),
})

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),
  email: emailSchema,
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject is too long'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long'),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Type exports
export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type WaitlistInput = z.infer<typeof waitlistSchema>
export type AIRequestInput = z.infer<typeof aiRequestSchema>
export type LessonProgressInput = z.infer<typeof lessonProgressSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type ContactFormInput = z.infer<typeof contactFormSchema>
export type PaginationInput = z.infer<typeof paginationSchema>