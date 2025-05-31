'use client'

import { ArrowLeft, Mail, MessageCircle, Clock, Send, Heart, Sparkles, Users, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'

const contactReasons = [
  {
    icon: HelpCircle,
    title: 'General Questions',
    description: 'Curious about Zenya? We'd love to hear from you!',
    email: 'hello@zenya.app'
  },
  {
    icon: Heart,
    title: 'Partnership Opportunities',
    description: 'Interested in working together? Let's chat!',
    email: 'partnerships@zenya.app'
  },
  {
    icon: Users,
    title: 'Press & Media',
    description: 'Writing about Zenya? We're here to help.',
    email: 'press@zenya.app'
  },
  {
    icon: Sparkles,
    title: 'Feature Requests',
    description: 'Have ideas to make Zenya better? Share them!',
    email: 'feedback@zenya.app'
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Message sent! We'll get back to you soon 🎉')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Premium Background */}
      <div className="fixed inset-0 gradient-mesh z-0" />
      
      {/* Animated Blobs */}
      <motion.div 
        className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/landing">
              <Button variant="ghost" className="mb-8 flex items-center gap-2 glass-subtle hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">Get in Touch</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We'd love to hear from you! Whether you have a question, feedback, or just want to say hi.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card variant="glass" className="shadow-premium">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6 text-gradient">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Name *
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="glass-subtle"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="glass-subtle"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject
                      </label>
                      <Input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="glass-subtle"
                        placeholder="What's this about?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl glass-subtle resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={6}
                        placeholder="Tell us what's on your mind..."
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full btn-premium"
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Send Message
                      <Send className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <Card variant="glass" className="shadow-premium">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Response Time</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">We typically respond within 24-48 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid sm:grid-cols-2 gap-4">
                {contactReasons.map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card variant="glass" className="h-full hover:shadow-premium transition-all duration-300 group">
                      <CardContent className="p-6 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <reason.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{reason.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{reason.description}</p>
                        <a 
                          href={`mailto:${reason.email}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          {reason.email}
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card variant="premium" className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-8 text-white">
                    <h3 className="text-2xl font-bold mb-4">Join our Community</h3>
                    <p className="mb-6 opacity-90">
                      Connect with other learners, share tips, and get support from the Zenya community.
                    </p>
                    <div className="flex gap-4">
                      <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 backdrop-blur">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Discord
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 backdrop-blur">
                        <Users className="w-4 h-4 mr-2" />
                        Forum
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* FAQ Teaser */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card variant="glass-subtle" className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-gradient">
                Looking for quick answers?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Check out our frequently asked questions for instant help.
              </p>
              <Link href="/faq">
                <Button variant="outline" className="glass-subtle hover:bg-white/20 dark:hover:bg-gray-800/20">
                  View FAQ
                  <HelpCircle className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </Card>
          </motion.section>
        </div>
      </div>
    </div>
  )
}