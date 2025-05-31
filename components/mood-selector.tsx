'use client'

import { motion } from 'framer-motion'
import type { Mood } from '@/types'
import { cn } from '@/lib/utils'

interface MoodSelectorProps {
  value: Mood | null
  onChange: (mood: Mood) => void
}

const moods: { value: Mood; label: string }[] = [
  { value: '😴', label: 'Low Energy' },
  { value: '😐', label: 'Neutral' },
  { value: '🙂', label: 'Good' },
  { value: '😄', label: 'Happy' },
  { value: '🔥', label: 'Energized' },
]

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex flex-wrap justify-center gap-4">
        {moods.map((mood, index) => (
          <motion.button
            key={mood.value}
            onClick={() => onChange(mood.value)}
            className={cn(
              'mood-button relative flex flex-col items-center gap-2 p-6 min-w-[100px]',
              'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm',
              'border border-gray-200/50 dark:border-gray-700/50',
              'hover:bg-white/70 dark:hover:bg-gray-800/70',
              'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
              value === mood.value && 'selected'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-4xl" role="img" aria-label={mood.label}>
              {mood.value}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {mood.label}
            </span>
            {value === mood.value && (
              <motion.div
                className="absolute inset-0 rounded-2xl ring-2 ring-blue-400 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20"
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