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
    console.log('Mood selected:', mood) // Debug log
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
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleMoodSelect(mood.value)
            }}
            className={cn(
              'mood-button relative flex flex-col items-center gap-2 p-6 min-w-[100px] min-h-[100px]',
              'rounded-2xl cursor-pointer select-none',
              'bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl',
              'border border-gray-200/50 dark:border-gray-700/50',
              'shadow-xl shadow-gray-200/20 dark:shadow-gray-900/30',
              'transition-all duration-300 ease-out',
              'transform-gpu backface-hidden',
              'hover:bg-white dark:hover:bg-gray-800',
              'hover:border-blue-400/50 dark:hover:border-blue-500/50',
              'hover:shadow-2xl hover:shadow-blue-500/20',
              'hover:-translate-y-1 hover:scale-110',
              'active:scale-95 active:translate-y-0',
              'focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2',
              'focus:border-blue-500',
              value === mood.value && [
                'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50',
                'dark:from-blue-950/50 dark:to-indigo-950/50',
                'ring-4 ring-blue-400/30 ring-offset-2',
                'shadow-2xl shadow-blue-500/30',
                isAnimating && 'animate-pulse'
              ]
            )}
            style={{
              animationDelay: `${index * 100}ms`,
              opacity: 0,
              animation: 'fadeInUp 0.5s ease-out forwards',
              WebkitTapHighlightColor: 'transparent',
              zIndex: 50,
              position: 'relative',
              isolation: 'isolate',
            }}
          >
            <span className="text-4xl pointer-events-none" role="img" aria-hidden="true">
              {mood.value}
            </span>
            <span 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 pointer-events-none"
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
            transform: translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .mood-button {
          will-change: transform, box-shadow;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        .mood-button::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          opacity: 0;
          z-index: -1;
          transition: opacity 0.3s ease-out;
          pointer-events: none;
        }
        
        .mood-button:hover::after {
          opacity: 0.1;
        }
        
        .mood-button[aria-checked="true"]::after {
          opacity: 0.2;
        }
      `}</style>
    </fieldset>
  )
}