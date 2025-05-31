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
      setParticles(Array.from({ length: 50 }, (_, i) => i))
      const timer = setTimeout(() => {
        setParticles([])
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {particles.map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-500"
              initial={{
                x: '50vw',
                y: '50vh',
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 100}vw`,
                y: `${50 + (Math.random() - 0.5) * 100}vh`,
                scale: [0, 1, 0],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2,
                ease: 'easeOut',
                delay: Math.random() * 0.5,
              }}
              style={{
                background: `hsl(${Math.random() * 360}, 70%, 50%)`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
              }}
            />
          ))}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Awesome job!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                You're making great progress!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}