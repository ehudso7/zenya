import { Suspense } from 'react'
import { ArrowRight, Brain, Sparkles, Target, Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { InteractiveDemo } from './interactive-demo'
import { WaitlistForm } from './waitlist-form'

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

  return (
    <div className="min-h-screen">
      <Navigation />
      {/* Optimized Background */}
      <div className="fixed inset-0 gradient-mesh z-0" />
      
      <main id="main-content" role="main">
      {/* Hero Section - Server Component */}
      <section className="relative overflow-hidden z-10" aria-labelledby="hero-heading">
        <div className="container mx-auto px-4 py-20 max-w-6xl">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 
              id="hero-heading"
              className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-scale-in"
            >
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Zenya
              </span>
            </h1>
            <p className="text-2xl md:text-3xl lg:text-4xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-medium animate-slide-up">
              Your calm, focused AI tutor — built for real humans with unique attention styles
            </p>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-slide-up">
              Learn anything in 5-minute bursts. Adapt to your mood. Celebrate every win.
              No judgment, just progress.
            </p>
            <div className="pt-8 animate-scale-in">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signin-password">
                  <Button 
                    size="lg" 
                    className="btn-premium text-lg px-10 py-6 rounded-2xl shadow-2xl w-full sm:w-auto"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/auth/signin-password">
                  <Button 
                    size="lg" 
                    variant="glass" 
                    className="text-lg px-10 py-6 rounded-2xl shadow-xl w-full sm:w-auto group relative overflow-hidden"
                  >
                    <span className="relative z-10">Sign In</span>
                    <span className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Simplified Decorative elements */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" aria-hidden="true" />
        <div className="absolute top-0 right-20 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-reverse" aria-hidden="true" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow" aria-hidden="true" />
      </section>

      {/* Features Section - Server Component */}
      <section className="py-24 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent dark:via-gray-900/30 backdrop-blur-sm" />
        <div className="container mx-auto px-4 max-w-6xl relative z-20">
          <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16 text-gradient">
              Learning that works with your brain, not against it
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Server Component */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gradient mb-4">
              How Zenya works
            </h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4 p-6 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:translate-x-2 animate-slide-in">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-gray-800 dark:text-gray-100">Check in with your mood</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Tell us how you're feeling today. Tired? Energized? We'll adapt.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:translate-x-2 animate-slide-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-gray-800 dark:text-gray-100">Get a bite-sized lesson</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    5 minutes of focused learning, tailored to your energy level.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:translate-x-2 animate-slide-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-gray-800 dark:text-gray-100">Celebrate your progress</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Earn XP, maintain streaks, and see your growth over time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section - Lazy Loaded */}
      <section className="py-20 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent dark:from-gray-900/50 dark:to-transparent" />
        <div className="container mx-auto px-4 max-w-4xl relative z-20">
          <div className="text-center space-y-8 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-4">
              See Zenya in action
            </h2>
            <Suspense fallback={
              <Card variant="glass" className="max-w-2xl mx-auto shadow-premium">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 h-96 flex items-center justify-center">
                    <div className="animate-pulse text-gray-500">Loading interactive demo...</div>
                  </div>
                </CardContent>
              </Card>
            }>
              <InteractiveDemo />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Testimonials - Server Component */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16 text-gradient">
              Loved by learners like you
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card variant="glass" className="h-full hover:shadow-premium hover:-translate-y-2 transition-all duration-300 group">
                    <CardContent className="p-8 space-y-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-500 text-xl animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                            ★
                          </span>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section - Lazy Loaded */}
      <section id="waitlist" className="py-24 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
        <div className="container mx-auto px-4 max-w-2xl text-center relative z-20">
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Be the first to try Zenya
            </h2>
            <p className="text-xl md:text-2xl text-white/90">
              Get early access, shape the future of calm learning, and lock in founder pricing.
            </p>
            <Suspense fallback={
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1 h-12 bg-white/20 rounded-lg animate-pulse" />
                <div className="h-12 w-32 bg-white rounded-lg animate-pulse" />
              </div>
            }>
              <WaitlistForm />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Footer - Server Component */}
      <footer className="py-16 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100 to-white dark:from-gray-900 dark:to-gray-800" />
        <div className="container mx-auto px-4 text-center relative z-20">
          <div className="animate-fade-in">
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
          </div>
        </div>
      </footer>
      </main>
    </div>
  )
}