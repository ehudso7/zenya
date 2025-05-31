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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">{currentLesson?.title || 'Loading...'}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user?.mood && `Feeling ${user.mood}`}
            </p>
          </div>
          <div className="w-20" /> {/* Spacer for alignment */}
        </header>

        {/* Progress Bar */}
        <div className="mb-4">
          <Progress value={lessonProgress} max={100} size="sm" />
        </div>

        {/* Chat Interface */}
        <Card className="mb-4 h-[400px] overflow-hidden">
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
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
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
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2 mb-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleExplainLikeImFive}
                  className="flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  Explain Like I'm 5
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleIDontGetIt}
                  className="flex items-center gap-1"
                >
                  <HelpCircle className="w-4 h-4" />
                  I Don't Get It
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex items-center gap-1"
                >
                  <Brain className="w-4 h-4" />
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
                <Button type="submit" disabled={!input.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Today's Journal */}
        <Card variant="bordered">
          <CardContent className="py-4">
            <h3 className="font-medium mb-2">Today's Reflection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              {lessonProgress > 50
                ? "You're making great progress! Keep going, you've got this!"
                : "Every step forward is a victory. Take your time!"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}