'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Send, Brain, Sparkles, HelpCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/lib/store'
import { lessons } from '@/lib/lessons'
import { generateId, shuffleArray } from '@/lib/utils'
import type { Lesson, ChatMessage } from '@/types'

export default function LearnPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { 
    user, 
    currentLesson, 
    setCurrentLesson, 
    lessonProgress,
    setLessonProgress,
    messages,
    addMessage,
    clearMessages,
    addXP,
    setShowCelebration
  } = useStore()

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Load a random lesson on mount
    if (!currentLesson) {
      const randomLesson = shuffleArray(lessons)[0]
      setCurrentLesson(randomLesson)
    }
    // Clear previous messages
    clearMessages()
  }, [])

  useEffect(() => {
    // Start the lesson flow
    if (currentLesson && messages.length === 0) {
      startLesson()
    }
  }, [currentLesson])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startLesson = () => {
    if (!currentLesson) return
    
    const firstStep = currentLesson.content[0]
    addMessage({
      id: generateId(),
      role: 'assistant',
      content: firstStep.content,
      timestamp: new Date().toISOString()
    })
    setCurrentStep(0)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !currentLesson) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }
    addMessage(userMessage)
    setInput('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      progressLesson()
      setIsTyping(false)
    }, 1000)
  }

  const progressLesson = () => {
    if (!currentLesson) return

    const nextStep = currentStep + 1
    if (nextStep < currentLesson.content.length) {
      const step = currentLesson.content[nextStep]
      addMessage({
        id: generateId(),
        role: 'assistant',
        content: step.content,
        timestamp: new Date().toISOString()
      })
      setCurrentStep(nextStep)
      
      // Update progress
      const progress = Math.round((nextStep / currentLesson.content.length) * 100)
      setLessonProgress(progress)
      
      // Check if lesson is complete
      if (step.type === 'reflection') {
        completeLesson()
      }
    }
  }

  const completeLesson = () => {
    addXP(15)
    setShowCelebration(true)
    toast.success('Lesson complete! +15 XP earned! 🎉')
    
    setTimeout(() => {
      setShowCelebration(false)
    }, 3000)
  }

  const handleExplainLikeImFive = () => {
    addMessage({
      id: generateId(),
      role: 'assistant',
      content: "Let me break that down super simply! Think of it like building blocks - we take one tiny piece at a time and stack them up. No rush, just one block at a time! 🧱",
      timestamp: new Date().toISOString()
    })
  }

  const handleIDontGetIt = () => {
    addMessage({
      id: generateId(),
      role: 'assistant',
      content: "No worries at all! Let's try a different angle. Sometimes our brains just need a different door to walk through. How about we use a real-life example you can relate to? 🚪",
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="container mx-auto px-4 py-4 max-w-4xl relative">
        {/* Header */}
        <motion.header 
          className="flex items-center justify-between mb-6 glass-subtle rounded-2xl p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:bg-white/20 dark:hover:bg-gray-800/20"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gradient">{currentLesson?.title || 'Loading...'}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user?.mood && `Feeling ${user.mood}`}
            </p>
          </div>
          <div className="w-20" /> {/* Spacer for alignment */}
        </motion.header>

        {/* Progress Bar */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="relative">
            <Progress value={lessonProgress} max={100} size="sm" className="h-3" />
            <div className="absolute inset-0 h-3 rounded-full overflow-hidden">
              <div className="progress-fill h-full" style={{ width: `${lessonProgress}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card variant="glass" className="mb-6 h-[500px] overflow-hidden shadow-premium" hover={false}>
            <CardContent className="p-0 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.role === 'user'
                          ? 'chat-bubble chat-bubble-user animate-slide-in'
                          : 'chat-bubble chat-bubble-ai animate-slide-in'
                      }`}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="chat-bubble chat-bubble-ai">
                    <div className="flex gap-1">
                      <span className="loading-dot" />
                      <span className="loading-dot" />
                      <span className="loading-dot" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200/20 dark:border-gray-700/20 p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <div className="flex gap-2 mb-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleExplainLikeImFive}
                  className="flex items-center gap-1 glass-subtle hover:scale-105 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Explain Like I'm 5
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleIDontGetIt}
                  className="flex items-center gap-1 glass-subtle hover:scale-105 transition-all"
                >
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  I Don't Get It
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex items-center gap-1 hover:bg-purple-100/20 dark:hover:bg-purple-900/20 hover:scale-105 transition-all"
                >
                  <Brain className="w-4 h-4 text-purple-500" />
                  Brain Fog Mode
                </Button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your answer or ask a question..."
                  disabled={isTyping}
                />
                <Button type="submit" disabled={!input.trim() || isTyping} className="btn-premium">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Journal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card variant="glass-subtle" className="shadow-sm hover:shadow-premium transition-all">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-3 text-gradient flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Today's Reflection
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                {lessonProgress > 50
                  ? "You're making great progress! Keep going, you've got this! 🌟"
                  : "Every step forward is a victory. Take your time! 🌱"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}