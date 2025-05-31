'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ArrowRight, Brain, Sparkles, Target, Heart, Zap, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Brain,
    title: 'Built for neurodiverse minds',
    description: 'Short, clear lessons that adapt to your mood and energy levels'
  },
  {
    icon: Sparkles,
    title: '"Explain Like I\'m 5" mode',
    description: 'Instant simplification when things get overwhelming'
  },
  {
    icon: Target,
    title: 'Daily micro-wins',
    description: 'Build confidence with achievable goals and instant rewards'
  },
  {
    icon: Heart,
    title: '100% judgment-free',
    description: 'A safe space to learn at your own pace, your own way'
  }
]

const testimonials = [
  {
    quote: "Finally, an app that gets how my brain works!",
    author: "Sarah M.",
    role: "ADHD learner"
  },
  {
    quote: "The mood check-in feature is a game-changer.",
    author: "Alex R.",
    role: "Neurodivergent student"
  },
  {
    quote: "I actually look forward to my daily lessons now.",
    author: "Jamie L.",
    role: "Adult learner"
  }
]

export default function LandingPage() {
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
    } catch (error) {
      toast.error('Failed to join waitlist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Zenya
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Your calm, focused AI tutor — built for real humans with real attention struggles
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Learn anything in 5-minute bursts. Adapt to your mood. Celebrate every win.
              No judgment, just progress.
            </p>
            <div className="pt-8">
              <a href="#waitlist">
                <Button size="lg" className="text-lg px-8 py-6">
                  Join the Waitlist
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Learning that works with your brain, not against it
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center space-y-4">
                      <feature.icon className="w-12 h-12 mx-auto text-primary-600" />
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              How Zenya works
            </h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Check in with your mood</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tell us how you're feeling today. Tired? Energized? We'll adapt.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Get a bite-sized lesson</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    5 minutes of focused learning, tailored to your energy level.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Celebrate your progress</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Earn XP, maintain streaks, and see your growth over time.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              See Zenya in action
            </h2>
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-left space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Zenya</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Hi! Today's quick win is about fractions. 🍕
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mt-2">
                        Imagine a pizza cut into 4 slices. If you eat 1 slice, you've eaten 1/4 of the pizza!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">You</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        So 2 slices would be 2/4?
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Zenya</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Exactly! And here's a cool trick: 2/4 is the same as 1/2. You've got half the pizza! 🎉
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 justify-center">
                  <Button size="sm" variant="secondary">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Explain Like I'm 5
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Zap className="w-4 h-4 mr-1" />
                    Brain Fog Mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Loved by learners like you
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-500">★</span>
                        ))}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 italic">
                        "{testimonial.quote}"
                      </p>
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Be the first to try Zenya
            </h2>
            <p className="text-xl opacity-90">
              Get early access, shape the future of calm learning, and lock in founder pricing.
            </p>
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                required
              />
              <Button
                type="submit"
                size="lg"
                variant="secondary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Join Waitlist
              </Button>
            </form>
            <div className="flex items-center justify-center gap-4 text-sm opacity-80">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                No spam, ever
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Early bird perks
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © 2025 Zenya. Built for brains that zig when others zag.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <a href="/privacy" className="hover:text-primary-600 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-primary-600 transition-colors">
              Terms of Service
            </a>
            <a href="mailto:hello@zenya.app" className="hover:text-primary-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}