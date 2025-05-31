'use client'

import { Home, Search, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const suggestions = [
  { text: 'Go to Homepage', href: '/landing', icon: Home },
  { text: 'Learn More', href: '/learn', icon: Sparkles },
  { text: 'Contact Us', href: '/contact', icon: Search }
]

export default function NotFoundPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Premium Background */}
      <div className="fixed inset-0 gradient-mesh z-0" />
      
      {/* Animated Blobs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <Card variant="glass" className="shadow-premium overflow-hidden">
            <CardContent className="p-0">
              {/* Error Code Section */}
              <div className="relative p-12 pb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="relative"
                >
                  <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                    404
                  </h1>
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Message Section */}
              <div className="p-8 pt-0 space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-3xl font-bold text-gradient">
                    Oops! Page Not Found
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Looks like you've wandered into uncharted territory. Don't worry, even the best explorers get lost sometimes!
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="grid sm:grid-cols-3 gap-4"
                >
                  {suggestions.map((suggestion, index) => (
                    <Link key={index} href={suggestion.href}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card variant="glass-subtle" className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <suggestion.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {suggestion.text}
                            </span>
                          </div>
                        </Card>
                      </motion.div>
                    </Link>
                  ))}
                </motion.div>

                {/* Fun Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="pt-4"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                    "Not all those who wander are lost... but you might be!" 
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                    — Zenya's friendly reminder
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-8"
          >
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="glass-subtle hover:bg-white/20 dark:hover:bg-gray-800/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}