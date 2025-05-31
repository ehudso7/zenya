'use client'

import { ArrowLeft, Shield, Lock, Eye, UserCheck, Bell, Database, Globe, Mail } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const privacySections = [
  {
    icon: Shield,
    title: 'Your Privacy Matters',
    description: 'We are committed to protecting your personal information and being transparent about what we collect.'
  },
  {
    icon: Lock,
    title: 'Data Security',
    description: 'Industry-standard encryption and security measures protect your data at every step.'
  },
  {
    icon: UserCheck,
    title: 'Your Control',
    description: 'You have full control over your data. Access, export, or delete it anytime.'
  }
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative">
      {/* Premium Background */}
      <div className="fixed inset-0 gradient-mesh z-0" />
      
      {/* Animated Blobs */}
      <motion.div 
        className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Privacy Policy</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your trust is important to us. Here's how we protect and handle your data.
            </p>
          </motion.div>

          {/* Key Privacy Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {privacySections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="glass" className="h-full hover:shadow-premium transition-all duration-300 group">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <section.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{section.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Privacy Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card variant="glass" className="shadow-premium">
              <CardContent className="p-8">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <div className="space-y-12">
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        1
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Introduction</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Zenya ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered learning application.
                    </p>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <Database className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Information We Collect</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card variant="glass-subtle" className="p-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-blue-500" />
                          Information You Provide
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            Email address (for waitlist and authentication)
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            Mood selections and learning preferences
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            Responses to lessons and interactions with our AI tutor
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            Optional profile information
                          </li>
                        </ul>
                      </Card>
                      <Card variant="glass-subtle" className="p-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-purple-500" />
                          Automatically Collected
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-500 mt-1">•</span>
                            Usage data (lessons completed, time spent)
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-500 mt-1">•</span>
                            Device information (browser, OS)
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-500 mt-1">•</span>
                            General location (country/region level)
                          </li>
                        </ul>
                      </Card>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        3
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">How We Use Your Information</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">We use your information to:</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card variant="glass-subtle" className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">✨ Provide and personalize your learning experience</p>
                      </Card>
                      <Card variant="glass-subtle" className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">🎯 Adapt content to your mood and learning style</p>
                      </Card>
                      <Card variant="glass-subtle" className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">📊 Track your progress and provide insights</p>
                      </Card>
                      <Card variant="glass-subtle" className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">🚀 Improve our AI tutor and lesson content</p>
                      </Card>
                      <Card variant="glass-subtle" className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">📧 Send important updates about the service</p>
                      </Card>
                      <Card variant="glass-subtle" className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">💬 Respond to your questions and support</p>
                      </Card>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Data Security</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      We implement industry-standard security measures to protect your information:
                    </p>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">Encryption of data in transit and at rest</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">Regular security audits and updates</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">Limited access to personal information</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">Secure authentication methods</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        5
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Data Sharing</h2>
                    </div>
                    <Card variant="premium" className="p-6">
                      <p className="text-gray-700 dark:text-gray-300 mb-4 font-semibold">
                        🚫 We do not sell, trade, or rent your personal information.
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">We may share your information only:</p>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">✓</span>
                          With your explicit consent
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">✓</span>
                          To comply with legal obligations
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">✓</span>
                          To protect our rights and safety
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">✓</span>
                          With service providers under strict confidentiality
                        </li>
                      </ul>
                    </Card>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Your Rights</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">You have full control over your data:</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 cursor-pointer">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📋 Access your information</p>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 cursor-pointer">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">✏️ Correct inaccurate data</p>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 cursor-pointer">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">🗑️ Request deletion</p>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 cursor-pointer">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">💾 Export your data</p>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4 cursor-pointer">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">🔕 Opt-out of marketing</p>
                      </motion.div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        7
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Children's Privacy</h2>
                    </div>
                    <Card variant="glass-subtle" className="p-6 border-l-4 border-pink-500">
                      <p className="text-gray-700 dark:text-gray-300">
                        Zenya is designed for adults. We do not knowingly collect information from children under 13. If you believe we have collected information from a child, please contact us immediately.
                      </p>
                    </Card>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <Mail className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Contact Us</h2>
                    </div>
                    <Card variant="glass" className="p-6">
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        If you have questions about this Privacy Policy or our data practices, please contact us:
                      </p>
                      <div className="space-y-2">
                        <a href="mailto:privacy@zenyaai.com" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                          <Mail className="w-4 h-4" />
                          privacy@zenyaai.com
                        </a>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Response time: Within 48 hours
                        </p>
                      </div>
                    </Card>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <Bell className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Changes to This Policy</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                    </p>
                  </section>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}