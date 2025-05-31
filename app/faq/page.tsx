'use client'

import { ArrowLeft, ChevronDown, Search, Sparkles, Brain, CreditCard, Shield, Clock, Users, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const faqCategories = [
  {
    icon: Brain,
    title: 'Getting Started',
    questions: [
      {
        q: 'What is Zenya?',
        a: 'Zenya is an AI-powered learning companion designed specifically for neurodiverse adults. We use adaptive micro-lessons, mood-based learning, and gamification to make education accessible, enjoyable, and effective for minds that work differently.'
      },
      {
        q: 'Who is Zenya for?',
        a: 'Zenya is built for adults with ADHD, autism, dyslexia, and other neurodevelopmental differences. However, anyone who struggles with traditional learning methods or wants a more personalized, flexible approach to education can benefit from Zenya.'
      },
      {
        q: 'How does the mood check-in work?',
        a: 'Before each lesson, Zenya asks how you\'re feeling - energized, focused, tired, or overwhelmed. Based on your response, we adapt the lesson length, complexity, and style to match your current state. This ensures you\'re always learning at your optimal capacity.'
      }
    ]
  },
  {
    icon: Sparkles,
    title: 'Features',
    questions: [
      {
        q: 'What is "Explain Like I\'m 5" mode?',
        a: 'It\'s our instant simplification feature. When a concept feels overwhelming, just tap this button and Zenya will break it down into the simplest possible terms, using everyday analogies and examples. Perfect for brain fog days!'
      },
      {
        q: 'How long are the lessons?',
        a: 'Lessons are typically 5 minutes long, but they adapt to your mood and energy level. If you\'re feeling great, you might get a 7-minute lesson. If you\'re tired, it might be just 3 minutes. The goal is sustainable, daily progress.'
      },
      {
        q: 'Can I learn multiple subjects?',
        a: 'Absolutely! Zenya covers a wide range of topics from practical skills like cooking and budgeting to academic subjects like math and science. You can switch between subjects anytime or focus on one area.'
      }
    ]
  },
  {
    icon: CreditCard,
    title: 'Pricing & Plans',
    questions: [
      {
        q: 'How much does Zenya cost?',
        a: 'We\'re currently in beta with special early-bird pricing. Join our waitlist to lock in founder rates. We believe in making learning accessible, so we\'ll always have affordable options and financial assistance available.'
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes! We offer a 14-day free trial so you can experience Zenya\'s full features. No credit card required to start, and you can cancel anytime.'
      },
      {
        q: 'What\'s included in the subscription?',
        a: 'Full access to all subjects, unlimited lessons, progress tracking, achievement system, AI tutor conversations, mood-adaptive learning, and all future features we add.'
      }
    ]
  },
  {
    icon: Shield,
    title: 'Privacy & Safety',
    questions: [
      {
        q: 'Is my data safe?',
        a: 'Absolutely. We use industry-standard encryption for all data, never sell your information, and you have full control over your data. You can export or delete it anytime. Check our Privacy Policy for full details.'
      },
      {
        q: 'Can I use Zenya anonymously?',
        a: 'Yes! You can create an account with just an email address. We don\'t require real names or personal details beyond what\'s needed for your learning experience.'
      },
      {
        q: 'Is Zenya a replacement for therapy or medical treatment?',
        a: 'No. Zenya is an educational tool, not a medical service. While we\'re designed with neurodiversity in mind, we\'re not a substitute for professional medical advice, diagnosis, or treatment. Always consult healthcare professionals for medical concerns.'
      }
    ]
  },
  {
    icon: Clock,
    title: 'Using Zenya',
    questions: [
      {
        q: 'What if I miss a day?',
        a: 'No pressure! Your streak might reset, but your progress is always saved. Zenya is designed for real life - we celebrate consistency, not perfection. Jump back in whenever you\'re ready.'
      },
      {
        q: 'Can I repeat lessons?',
        a: 'Of course! Review any lesson as many times as you need. Repetition is a powerful learning tool, especially for neurodiverse minds. We\'ll even adapt repeated lessons based on what you struggled with.'
      },
      {
        q: 'How does the AI tutor work?',
        a: 'Our AI tutor provides personalized explanations, answers your questions, and offers encouragement. It remembers your learning style and adapts its teaching approach. Think of it as a patient, always-available study buddy!'
      }
    ]
  },
  {
    icon: Users,
    title: 'Community & Support',
    questions: [
      {
        q: 'Is there a community?',
        a: 'Yes! We have a supportive Discord community where learners share tips, celebrate wins, and support each other. It\'s a judgment-free zone designed for neurodiverse adults.'
      },
      {
        q: 'How do I get help if I\'m stuck?',
        a: 'Multiple ways! Use the in-app help button, email support@zenyaai.com, or ask in our community. We typically respond within 24 hours and are always working to improve based on your feedback.'
      },
      {
        q: 'Can I suggest new features or subjects?',
        a: 'Absolutely! We love hearing from our users. Use the feedback button in the app or email feedback@zenyaai.com. Many of our best features came from user suggestions!'
      }
    ]
  }
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => 
    !selectedCategory || category.title === selectedCategory || category.questions.length > 0
  )

  return (
    <div className="min-h-screen relative">
      {/* Premium Background */}
      <div className="fixed inset-0 gradient-mesh z-0" />
      
      {/* Animated Blobs */}
      <motion.div 
        className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
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
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Got questions? We've got answers! Find everything you need to know about Zenya.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 glass-subtle"
                />
              </div>
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <Button
              size="sm"
              variant={!selectedCategory ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={!selectedCategory ? "btn-premium" : "glass-subtle hover:bg-white/20 dark:hover:bg-gray-800/20"}
            >
              All Categories
            </Button>
            {faqCategories.map((category) => (
              <Button
                key={category.title}
                size="sm"
                variant={selectedCategory === category.title ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.title)}
                className={selectedCategory === category.title ? "btn-premium" : "glass-subtle hover:bg-white/20 dark:hover:bg-gray-800/20"}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.title}
              </Button>
            ))}
          </motion.div>

          {/* FAQ Items */}
          <div className="space-y-8">
            {filteredCategories.map((category, categoryIndex) => (
              category.questions.length > 0 && (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gradient">{category.title}</h2>
                  </div>

                  <div className="space-y-4">
                    {category.questions.map((item, index) => {
                      const itemId = `${category.title}-${index}`
                      const isOpen = openItems.includes(itemId)

                      return (
                        <Card
                          key={index}
                          variant="glass"
                          className="overflow-hidden hover:shadow-premium transition-all duration-300"
                        >
                          <CardContent className="p-0">
                            <button
                              onClick={() => toggleItem(itemId)}
                              className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <h3 className="font-semibold text-gray-800 dark:text-gray-100 pr-2">
                                {item.q}
                              </h3>
                              <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex-shrink-0"
                              >
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              </motion.div>
                            </button>
                            
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-6 pt-0">
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                      {item.a}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </motion.div>
              )
            ))}
          </div>

          {/* Still Need Help */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Card variant="premium" className="p-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gradient">
                Still have questions?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Can't find what you're looking for? Our friendly support team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="btn-premium">
                    Contact Support
                    <Sparkles className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" className="glass-subtle hover:bg-white/20 dark:hover:bg-gray-800/20">
                  <Users className="mr-2 w-4 h-4" />
                  Join Community
                </Button>
              </div>
            </Card>
          </motion.section>
        </div>
      </div>
    </div>
  )
}