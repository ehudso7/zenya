'use client'

import { ArrowLeft, Heart, Sparkles, Users, Target, Brain, Rocket } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const values = [
  {
    icon: Heart,
    title: 'Empathy First',
    description: 'We understand the unique challenges of neurodiverse minds and design with compassion.'
  },
  {
    icon: Sparkles,
    title: 'Joy in Learning',
    description: 'Learning should spark curiosity and excitement, not stress and anxiety.'
  },
  {
    icon: Users,
    title: 'Inclusive by Design',
    description: 'Built for everyone, especially those who learn differently.'
  },
  {
    icon: Target,
    title: 'Small Steps, Big Impact',
    description: 'We believe in the power of micro-achievements to build lasting confidence.'
  }
]

const team = [
  {
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    bio: 'Diagnosed with ADHD at 28, Sarah built Zenya to be the learning tool she wished she had.',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    name: 'Dr. Marcus Williams',
    role: 'Chief Learning Officer',
    bio: 'Neuroscience PhD with 15 years researching adaptive learning technologies.',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    name: 'Alex Rivera',
    role: 'Head of AI',
    bio: 'Former educator turned AI engineer, passionate about personalized learning.',
    gradient: 'from-green-500 to-emerald-600'
  }
]

const milestones = [
  {
    date: '2023',
    title: 'The Idea Sparks',
    description: 'Sarah explores alternative learning approaches and envisions something better'
  },
  {
    date: '2024',
    title: 'Building Begins',
    description: 'Team assembles, AI development starts, first prototypes tested'
  },
  {
    date: '2025',
    title: 'Zenya Launches',
    description: 'Beta release to eager learners, community begins to grow'
  },
  {
    date: 'Future',
    title: 'Your Story',
    description: 'Join us in revolutionizing how neurodiverse minds learn and thrive'
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen relative">
      {/* Premium Background */}
      <div className="fixed inset-0 gradient-mesh z-0" />
      
      {/* Animated Blobs */}
      <motion.div 
        className="absolute top-10 left-20 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-10 right-20 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, -100, 0],
          y: [0, 100, 0],
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

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">About Zenya</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We're on a mission to make learning accessible, enjoyable, and effective for every type of mind.
            </p>
          </motion.div>

          {/* Mission Section */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <Card variant="glass" className="shadow-premium overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 md:p-12 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gradient">Our Mission</h2>
                    </div>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      To create a world where neurodiverse adults can learn anything they want, at their own pace, without judgment or frustration.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      We believe that traditional learning methods weren't designed for everyone. That's why we're building something different — a learning companion that adapts to you, celebrates your progress, and never makes you feel less than capable.
                    </p>
                  </div>
                  <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-8 md:p-12 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 opacity-10"
                    >
                      <Brain className="w-full h-full" />
                    </motion.div>
                    <div className="relative text-white text-center space-y-4">
                      <h3 className="text-4xl font-bold">10M+</h3>
                      <p className="text-xl">Adults with ADHD in the US alone</p>
                      <p className="text-sm opacity-90">Each deserving tools that work with their unique minds</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Values Section */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card variant="glass" className="h-full hover:shadow-premium transition-all duration-300 group">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <value.icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{value.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Team Section */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
              Meet the Team
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card variant="glass" className="hover:shadow-premium transition-all duration-300">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${member.gradient} p-1`}>
                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                          <span className="text-3xl font-bold text-gradient">{member.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{member.name}</h3>
                        <p className="text-sm text-purple-600 dark:text-purple-400">{member.role}</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Journey Timeline */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
              Our Journey
            </h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-purple-500 to-pink-600 opacity-20" />
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                  >
                    <Card variant="glass" className="max-w-md relative">
                      <div className="absolute top-1/2 transform -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-lg" />
                      <CardContent className="p-6">
                        <div className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">{milestone.date}</div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{milestone.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card variant="premium" className="p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
                Join Our Mission
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Whether you're a learner, educator, or just someone who believes in our mission, we'd love to have you be part of the Zenya story.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/landing#waitlist">
                  <Button size="lg" className="btn-premium">
                    Join the Waitlist
                    <Sparkles className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="glass" className="hover:bg-white/20 dark:hover:bg-gray-800/20">
                    Get in Touch
                    <Heart className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.section>
        </div>
      </div>
    </div>
  )
}