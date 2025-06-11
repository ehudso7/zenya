'use client'

import { useState } from 'react'
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

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  
  const handleMoodSelect = (mood: Mood) => {
    setIsAnimating(true)
    onChange(mood)
    setTimeout(() => setIsAnimating(false), 300)
  }
  
  return (
    <fieldset className="flex flex-col items-center space-y-6">
      <legend className="sr-only">Select your current mood</legend>
      <div 
        className="flex flex-wrap justify-center gap-4"
        role="radiogroup"
        aria-label="Current mood selection"
      >
        {moods.map((mood, index) => (
          <button
            key={mood.value}
            type="button"
            role="radio"
            aria-checked={value === mood.value}
            aria-label={`Select ${mood.label} mood`}
            aria-describedby={`mood-${mood.value}-desc`}
            onClick={() => handleMoodSelect(mood.value)}
            className={cn(
              'mood-button relative flex flex-col items-center gap-2 p-6 min-w-[100px] min-h-[100px]',
              'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm',
              'border border-gray-200/50 dark:border-gray-700/50',
              'md:hover:bg-white/70 dark:md:hover:bg-gray-800/70',
              'active:bg-white/80 dark:active:bg-gray-800/80',
              'touch-manipulation',
              'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
              'transition-all duration-300 ease-out',
              'transform hover:scale-105 active:scale-95',
              value === mood.value && [
                'ring-2 ring-blue-400',
                'bg-gradient-to-br from-blue-50/50 to-indigo-50/50',
                'dark:from-blue-900/20 dark:to-indigo-900/20',
                isAnimating && 'animate-pulse'
              ]
            )}
            style={{
              animationDelay: `${index * 100}ms`,
              opacity: 0,
              animation: 'fadeInUp 0.5s ease-out forwards'
            }}
          >
            <span className="text-4xl" role="img" aria-hidden="true">
              {mood.value}
            </span>
            <span 
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
              id={`mood-${mood.value}-desc`}
            >
              {mood.label}
            </span>
            {value === mood.value && (
              <span className="sr-only">Currently selected</span>
            )}
          </button>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </fieldset>
  )
}