'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CelebrationProps {
  show: boolean
}

export function Celebration({ show }: CelebrationProps) {
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    if (show) {
      setParticles(Array.from({ length: 80 }, (_, i) => i))
      const timer = setTimeout(() => {
        setParticles([])
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* Premium confetti effect */}
          {particles.map((i) => {
            const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']
            const color = colors[Math.floor(Math.random() * colors.length)]
            const size = Math.random() * 12 + 4
            
            return (
              <motion.div
                key={i}
                className="absolute particle"
                initial={{
                  x: '50vw',
                  y: '50vh',
                  scale: 0,
                  rotate: 0,
                  opacity: 1,
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 120}vw`,
                  y: `${50 + (Math.random() - 0.5) * 120}vh`,
                  scale: [0, 1.5, 0],
                  rotate: Math.random() * 720,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 3,
                  ease: 'easeOut',
                  delay: Math.random() * 0.8,
                }}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  background: `linear-gradient(135deg, ${color}, ${color}99)`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '20%',
                  boxShadow: `0 0 ${size}px ${color}40`,
                }}
              />
            )
          }
          ))}
          {/* Premium celebration modal */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="glass shadow-premium rounded-3xl p-10 text-center max-w-md mx-4"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: [0, 1.3, 1], rotate: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="text-7xl mb-6"
              >
                🎉
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold mb-3 text-gradient"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Awesome job!
              </motion.h2>
              <motion.p 
                className="text-gray-600 dark:text-gray-300 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                You're making incredible progress! Keep it up! ✨
              </motion.p>
              <motion.div
                className="mt-6 flex justify-center gap-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                {['⭐', '⭐', '⭐', '⭐', '⭐'].map((star, i) => (
                  <motion.span
                    key={i}
                    className="text-2xl"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: [0, 1.5, 1] }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                  >
                    {star}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}