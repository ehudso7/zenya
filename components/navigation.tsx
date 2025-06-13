'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Info, Mail, HelpCircle, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: Info },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/contact', label: 'Contact', icon: Mail },
]


export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  
  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Logged out successfully')
      router.push('/landing')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to sign out. Please try again.')
    }
  }

  return (
    <nav id="navigation" className="sticky top-0 z-50 glass border-b border-white/10" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg" aria-label="Zenya home page">
            <motion.div
              className="text-2xl font-bold text-gradient"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Zenya
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6" role="menubar">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                aria-current={pathname === item.href ? 'page' : undefined}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1",
                  pathname === item.href
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <item.icon className="w-4 h-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" role="separator" aria-orientation="vertical" />
            
            {user ? (
              <Button 
                variant="glass" 
                size="sm" 
                onClick={handleLogout}
                aria-label="Logout from your account"
              >
                <LogOut className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Logout
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/auth/signin-password')}
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Button>
                <Button 
                  variant="glass" 
                  size="sm"
                  onClick={() => router.push('/auth/signin-password')}
                  aria-label="Get started with Zenya"
                >
                  <User className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <div className="space-y-1.5" aria-hidden="true">
              <div className={cn(
                "w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all",
                isMobileMenuOpen && "rotate-45 translate-y-2"
              )} />
              <div className={cn(
                "w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all",
                isMobileMenuOpen && "opacity-0"
              )} />
              <div className={cn(
                "w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all",
                isMobileMenuOpen && "-rotate-45 -translate-y-2"
              )} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-white/10"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  role="menuitem"
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                    pathname === item.href
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className="w-4 h-4" aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700" role="separator">
                {user ? (
                  <Button 
                    variant="glass" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    aria-label="Logout from your account"
                  >
                    <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                    Logout
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        router.push('/auth/signin-password')
                        setIsMobileMenuOpen(false)
                      }}
                      aria-label="Sign in to your account"
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="glass" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        router.push('/auth/signin-password')
                        setIsMobileMenuOpen(false)
                      }}
                      aria-label="Get started with Zenya"
                    >
                      <User className="w-4 h-4 mr-2" aria-hidden="true" />
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}