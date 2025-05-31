'use client'

import { ArrowLeft, FileText, Users, AlertCircle, Scale, Heart, CreditCard, AlertTriangle, Ban, Gavel, Mail, Shield } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const termsSections = [
  {
    icon: FileText,
    title: 'Clear & Fair Terms',
    description: 'Our terms are written in plain language, designed to be understood by everyone.'
  },
  {
    icon: Shield,
    title: 'User Protection',
    description: 'Your rights and safety are our priority. We're committed to fair practices.'
  },
  {
    icon: Scale,
    title: 'Balanced Agreement',
    description: 'A fair relationship between Zenya and our users, built on mutual respect.'
  }
]

export default function TermsPage() {
  return (
    <div className="min-h-screen relative">
      {/* Premium Background */}
      <div className="fixed inset-0 gradient-mesh z-0" />
      
      {/* Animated Blobs */}
      <motion.div 
        className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, 100, 0],
          y: [0, -100, 0],
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
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Terms of Service</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Simple, transparent terms that protect both you and us. No legal jargon, just clarity.
            </p>
          </motion.div>

          {/* Key Terms Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {termsSections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="glass" className="h-full hover:shadow-premium transition-all duration-300 group">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <section.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{section.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Terms Content */}
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
                      <h2 className="text-2xl font-bold text-gradient">Acceptance of Terms</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      By accessing or using Zenya, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our service.
                    </p>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <Heart className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">What Zenya Offers</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Zenya is an AI-powered learning platform designed to help neurodiverse adults learn through personalized, adaptive micro-lessons:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card variant="glass-subtle" className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">🤖 AI tutoring and conversational learning</p>
                      </Card>
                      <Card variant="glass-subtle" className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">🎨 Mood-adaptive content delivery</p>
                      </Card>
                      <Card variant="glass-subtle" className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">📊 Progress tracking and gamification</p>
                      </Card>
                      <Card variant="glass-subtle" className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">📚 Educational content across subjects</p>
                      </Card>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <Users className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Your Account</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">To use certain features of Zenya, you may need to create an account. You agree to:</p>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">Provide accurate and complete information</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">Maintain the security of your account</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">Notify us immediately of any unauthorized use</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">Be responsible for all activities under your account</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <Ban className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Acceptable Use</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">You agree NOT to:</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card variant="glass-subtle" className="p-4 border-l-4 border-red-500">
                        <p className="text-sm text-gray-700 dark:text-gray-300">❌ Use Zenya for illegal or harmful purposes</p>
                      </Card>
                      <Card variant="glass-subtle" className="p-4 border-l-4 border-red-500">
                        <p className="text-sm text-gray-700 dark:text-gray-300">❌ Attempt to hack or compromise our systems</p>
                      </Card>
                      <Card variant="glass-subtle" className="p-4 border-l-4 border-red-500">
                        <p className="text-sm text-gray-700 dark:text-gray-300">❌ Share inappropriate or offensive content</p>
                      </Card>
                      <Card variant="glass-subtle" className="p-4 border-l-4 border-red-500">
                        <p className="text-sm text-gray-700 dark:text-gray-300">❌ Impersonate others or provide false info</p>
                      </Card>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Medical Disclaimer</h2>
                    </div>
                    <Card variant="premium" className="p-6 border-l-4 border-yellow-500">
                      <p className="font-bold text-gray-800 dark:text-gray-100 mb-2">
                        ⚠️ IMPORTANT: Zenya is NOT a medical service or therapy replacement.
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Zenya is an educational tool designed to support learning. It is not intended to diagnose, treat, cure, or prevent any medical condition, including ADHD or other neurodevelopmental conditions. Always consult with qualified healthcare professionals for medical advice.
                      </p>
                    </Card>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Intellectual Property</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      All content, features, and functionality of Zenya are owned by us and are protected by international copyright, trademark, and other intellectual property laws. You may not:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Copy, modify, or distribute our content without permission
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Use our trademarks or logos without authorization
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Create derivative works based on our service
                      </li>
                    </ul>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        7
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">User Content</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      By submitting content to Zenya (such as responses to lessons), you grant us a non-exclusive, worldwide, royalty-free license to use, process, and improve our service. You retain ownership of your content.
                    </p>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Payment Terms</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">If you purchase a subscription:</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">💳 Secure payment processing</p>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">🔄 Auto-renewal unless cancelled</p>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">💰 Fair refund policy</p>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">📢 Price change notifications</p>
                      </motion.div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Limitation of Liability</h2>
                    </div>
                    <Card variant="glass-subtle" className="p-6">
                      <p className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZENYA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
                      </p>
                    </Card>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        10
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Termination</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      We may terminate or suspend your account at any time for violations of these Terms. You may cancel your account at any time through your account settings.
                    </p>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        11
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Changes to Terms</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      We may update these Terms from time to time. We will notify you of material changes by posting the new Terms and updating the "Last updated" date. Your continued use constitutes acceptance of the new Terms.
                    </p>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <Gavel className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Governing Law</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      These Terms are governed by the laws of the United States, without regard to conflict of law principles.
                    </p>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        <Mail className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">Contact Information</h2>
                    </div>
                    <Card variant="glass" className="p-6">
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        For questions about these Terms, please contact us:
                      </p>
                      <div className="space-y-2">
                        <a href="mailto:legal@zenya.app" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                          <Mail className="w-4 h-4" />
                          legal@zenya.app
                        </a>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Response time: Within 48 hours
                        </p>
                      </div>
                    </Card>
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