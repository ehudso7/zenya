'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Zap, Lightbulb, Target, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AiChatProps {
  lessonId?: string
  lessonContext?: string
  onSimplify?: () => void
  className?: string
}

export function AiChat({ lessonId, lessonContext, onSimplify, className }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState<'online' | 'degraded' | 'offline'>('online')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const { user } = useStore()
  const userMood = user?.learning_preferences?.mood || 'focused'

  // Check AI status on mount
  useEffect(() => {
    const abortController = new AbortController()
    
    const checkAiStatus = async () => {
      try {
        const response = await fetch('/api/ai/status', { signal: abortController.signal })
        const data = await response.json()
        setAiStatus(data.status)
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Request was aborted, don't update state
          return
        }
        setAiStatus('offline')
      }
    }
    
    checkAiStatus()
    
    return () => {
      abortController.abort()
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          context: lessonContext || 'general learning',
          lessonId,
          mood: userMood,
          previousMessages: messages.slice(-4) // Send last 4 messages for context
        }),
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }
      
      const data = await response.json()
      
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
      
      // Award XP for engagement
      if (data.xpAwarded) {
        const addXP = useStore.getState().addXP
        addXP(data.xpAwarded)
        toast.success(`+${data.xpAwarded} XP for active learning!`)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return // Request was cancelled
      }
      
      toast.error('Failed to get AI response. Please try again.')
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
      setInput(userMessage.content) // Restore input
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const quickActions = [
    { icon: Zap, label: 'Simplify', action: onSimplify },
    { icon: Lightbulb, label: 'Example', action: () => setInput('Can you give me an example?') },
    { icon: Target, label: 'Practice', action: () => setInput('Can we practice this concept?') },
  ]

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg", className)}>
      {/* AI Status Indicator */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">AI Tutor</h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={cn(
            "w-2 h-2 rounded-full",
            aiStatus === 'online' && "bg-green-500",
            aiStatus === 'degraded' && "bg-yellow-500",
            aiStatus === 'offline' && "bg-red-500"
          )} />
          <span className="text-gray-600 dark:text-gray-400">
            {aiStatus === 'online' && 'Online'}
            {aiStatus === 'degraded' && 'Limited'}
            {aiStatus === 'offline' && 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>Hi! I'm your AI tutor. Ask me anything about your lesson!</p>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex gap-3",
                message.role === 'user' && "justify-end"
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              )}
              
              <div className={cn(
                "max-w-[80%] rounded-lg px-4 py-2",
                message.role === 'user' 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
              )}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <time className={cn(
                  "text-xs mt-1 block",
                  message.role === 'user' 
                    ? "text-blue-200" 
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" aria-hidden="true" />
              <span className="sr-only">AI is thinking...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Actions */}
      <div className="px-4 py-2 flex gap-2 border-t border-gray-200 dark:border-gray-700">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={action.action}
            disabled={isLoading || aiStatus === 'offline'}
            className="flex items-center gap-1"
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Button>
        ))}
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder={aiStatus === 'offline' ? "AI is currently offline" : "Ask a question..."}
            disabled={isLoading || aiStatus === 'offline'}
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            rows={1}
            aria-label="Chat input"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isLoading || aiStatus === 'offline'}
            className="px-3"
            aria-label="Send message"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span className="sr-only">Sending message</span>
              </>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}