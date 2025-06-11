'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('You\'re on the list! We\'ll be in touch soon 🎉')
        setEmail('')
      } else {
        toast.error(data.error || 'Something went wrong')
      }
    } catch (_error) {
      toast.error('Failed to join waitlist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form 
        onSubmit={handleWaitlistSubmit} 
        className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
      >
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white/20 backdrop-blur-md border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 hover:bg-white/25 transition-all"
          required
        />
        <Button
          type="submit"
          size="lg"
          variant="secondary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="bg-white text-indigo-600 hover:bg-white/90 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
        >
          {isSubmitting ? 'Joining...' : 'Join Waitlist'}
        </Button>
      </form>
      <div className="flex items-center justify-center gap-6 text-sm text-white/80">
        <span className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          No spam, ever
        </span>
        <span className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          Early bird perks
        </span>
      </div>
    </div>
  )
}