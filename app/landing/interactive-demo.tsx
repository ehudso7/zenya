'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ChatMessage {
  role: 'zenya' | 'user'
  content: string
  timestamp?: Date
}

export function InteractiveDemo() {
  const [hasSimplified, setHasSimplified] = useState(false)
  const [hasGentlePace, setHasGentlePace] = useState(false)
  const chatBoxRef = useRef<HTMLDivElement>(null)
  const [demoMessages, setDemoMessages] = useState<ChatMessage[]>([
    {
      role: 'zenya',
      content: "Hi! Today's quick win is about fractions. 🍕\n\nImagine a pizza cut into 4 slices. If you eat 1 slice, you've eaten 1/4 of the pizza!"
    },
    {
      role: 'user',
      content: 'So 2 slices would be 2/4?'
    },
    {
      role: 'zenya',
      content: "Exactly! And here's a cool trick: 2/4 is the same as 1/2. You've got half the pizza! 🎉"
    }
  ])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [demoMessages])

  return (
    <Card variant="glass" className="max-w-2xl mx-auto shadow-premium hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-8">
        <div ref={chatBoxRef} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-left space-y-4 shadow-inner max-h-96 overflow-y-auto scroll-smooth">
          {demoMessages.map((message, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 animate-slide-in"
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              <div className={`w-10 h-10 rounded-full flex-shrink-0 shadow-lg ${
                message.role === 'zenya' 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse-slow' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
              }`} />
              <div>
                <p className={`font-semibold mb-1 ${message.role === 'zenya' ? 'text-gradient' : ''}`}>
                  {message.role === 'zenya' ? 'Zenya' : 'You'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3 justify-center">
          <Button 
            size="sm" 
            variant="secondary" 
            className="glass-subtle hover:scale-105 hover:shadow-lg transition-all"
            onClick={() => {
              if (!hasSimplified) {
                setDemoMessages(prev => [...prev, {
                  role: 'zenya',
                  content: "Let me break that down even simpler! 🌟\n\nThink of fractions like sharing. If you have 4 cookies and eat 2, you ate half of them. That's why 2/4 = 1/2. It's just two ways of saying 'half'!"
                }])
                setHasSimplified(true)
                toast.success('Concept simplified!')
              } else {
                toast('Already showing simplified version', {
                  icon: 'ℹ️',
                })
              }
            }}
            disabled={hasSimplified}
          >
            <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
            Simplify This
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            className="glass-subtle hover:scale-105 hover:shadow-lg transition-all"
            onClick={() => {
              if (!hasGentlePace) {
                setDemoMessages(prev => [...prev, {
                  role: 'zenya',
                  content: "Let's slow down a bit... 🌈\n\nFractions = parts of a whole\n• 1/4 = one part out of four\n• 2/4 = two parts out of four\n• 2/4 = 1/2 (both mean half)\n\nTake your time to absorb this. There's no rush! 💙"
                }])
                setHasGentlePace(true)
                toast.success('Switching to gentle pace!')
              } else {
                toast('Already in gentle pace mode', {
                  icon: 'ℹ️',
                })
              }
            }}
            disabled={hasGentlePace}
          >
            <Zap className="w-4 h-4 mr-1 text-purple-500" />
            Gentle Pace
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}