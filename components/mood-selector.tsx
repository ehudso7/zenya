'use client'

import { motion } from 'framer-motion'
import type { Mood } from '@/types'
import { cn } from '@/lib/utils'

interface MoodSelectorProps {
  value: Mood | null
  onChange: (mood: Mood) => void
}

const moods: { value: Mood; label: string }[] = [
  { value: '😴', label: 'Tired' },
  { value: '😐', label: 'Neutral' },
  { value: '🙂', label: 'Good' },
  { value: '😄', label: 'Happy' },
  { value: '🔥', label: 'Energized' },
]

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-medium">How are you feeling today?</h2>
      <div className="flex gap-4">
        {moods.map((mood) => (
          <motion.button
            key={mood.value}
            onClick={() => onChange(mood.value)}
            className={cn(
              'relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              value === mood.value && 'bg-primary-50 dark:bg-primary-900/20'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl" role="img" aria-label={mood.label}>
              {mood.value}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {mood.label}
            </span>
            {value === mood.value && (
              <motion.div
                className="absolute inset-0 rounded-xl ring-2 ring-primary"
                layoutId="mood-selector"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}