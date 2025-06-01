'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ArrowRight, Brain, Sparkles, Target, Heart, Zap, CheckCircle } from 'lucide-react'
import Link from 'next/link'
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
    title: 'Simplify This mode',
    description: 'Instant clarification when you need a different perspective'
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
    <div className="min-h-screen">
      {/* Premium Background */}
      <div className="fixed inset-0 gradient-mesh z-0" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden z-10">
        <div className="container mx-auto px-4 py-20 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <motion.h1 
              className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Zenya
              </span>
            </motion.h1>
            <motion.p 
              className="text-2xl md:text-3xl lg:text-4xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-medium"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your calm, focused AI tutor — built for real humans with unique attention styles
            </motion.p>
            <motion.p 
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Learn anything in 5-minute bursts. Adapt to your mood. Celebrate every win.
              No judgment, just progress.
            </motion.p>
            <motion.div 
              className="pt-8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="btn-premium text-lg px-10 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 animate-pulse" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button size="lg" variant="glass" className="text-lg px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Premium Decorative elements */}
        <motion.div 
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-0 right-20 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ 
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent dark:via-gray-900/30 backdrop-blur-sm" />
        <div className="container mx-auto px-4 max-w-6xl relative z-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16 text-gradient">
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
                  <Card variant="glass" className="h-full hover:shadow-premium hover:-translate-y-2 transition-all duration-300 group">
                    <CardContent className="p-8 text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gradient mb-4">
              How Zenya works
            </h2>
            <div className="space-y-8">
              <motion.div 
                className="flex items-start gap-4 p-6 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                whileHover={{ x: 10 }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-gray-800 dark:text-gray-100">Check in with your mood</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Tell us how you're feeling today. Tired? Energized? We'll adapt.
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-start gap-4 p-6 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                whileHover={{ x: 10 }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-gray-800 dark:text-gray-100">Get a bite-sized lesson</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    5 minutes of focused learning, tailored to your energy level.
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-start gap-4 p-6 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                whileHover={{ x: 10 }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-gray-800 dark:text-gray-100">Celebrate your progress</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Earn XP, maintain streaks, and see your growth over time.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent dark:from-gray-900/50 dark:to-transparent" />
        <div className="container mx-auto px-4 max-w-4xl relative z-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-4">
              See Zenya in action
            </h2>
            <Card variant="glass" className="max-w-2xl mx-auto shadow-premium hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-left space-y-4 shadow-inner">
                  <motion.div 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex-shrink-0 shadow-lg animate-pulse-slow" />
                    <div>
                      <p className="font-semibold mb-1 text-gradient">Zenya</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Hi! Today's quick win is about fractions. 🍕
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mt-2">
                        Imagine a pizza cut into 4 slices. If you eat 1 slice, you've eaten 1/4 of the pizza!
                      </p>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex-shrink-0 shadow-md" />
                    <div>
                      <p className="font-semibold mb-1">You</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        So 2 slices would be 2/4?
                      </p>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex-shrink-0 shadow-lg animate-pulse-slow" />
                    <div>
                      <p className="font-semibold mb-1 text-gradient">Zenya</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Exactly! And here's a cool trick: 2/4 is the same as 1/2. You've got half the pizza! 🎉
                      </p>
                    </div>
                  </motion.div>
                </div>
                <motion.div 
                  className="mt-6 flex gap-3 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Button size="sm" variant="secondary" className="glass-subtle hover:scale-105 transition-all">
                    <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
                    Simplify This
                  </Button>
                  <Button size="sm" variant="secondary" className="glass-subtle hover:scale-105 transition-all">
                    <Zap className="w-4 h-4 mr-1 text-purple-500" />
                    Gentle Pace
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16 text-gradient">
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
                  <Card variant="glass" className="h-full hover:shadow-premium hover:-translate-y-2 transition-all duration-300 group">
                    <CardContent className="p-8 space-y-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.span 
                            key={i} 
                            className="text-yellow-500 text-xl"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                          >
                            ★
                          </motion.span>
                        ))}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed">
                        "{testimonial.quote}"
                      </p>
                      <div className="pt-2">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{testimonial.author}</p>
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
      <section id="waitlist" className="py-24 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
        <div className="container mx-auto px-4 max-w-2xl text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Be the first to try Zenya
            </h2>
            <p className="text-xl md:text-2xl text-white/90">
              Get early access, shape the future of calm learning, and lock in founder pricing.
            </p>
            <motion.form 
              onSubmit={handleWaitlistSubmit} 
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
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
                Join Waitlist
              </Button>
            </motion.form>
            <motion.div 
              className="flex items-center justify-center gap-6 text-sm text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                No spam, ever
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Early bird perks
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100 to-white dark:from-gray-900 dark:to-gray-800" />
        <div className="container mx-auto px-4 text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold mb-4 text-gradient">Zenya</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              © 2025 Zenya. Built for brains that zig when others zag.
            </p>
            <div className="grid grid-cols-2 md:flex md:justify-center gap-4 md:gap-8 text-sm">
              <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                About
              </Link>
              <Link href="/faq" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                FAQ
              </Link>
              <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Contact
              </Link>
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Terms
              </Link>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}