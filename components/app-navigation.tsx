'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, LogOut, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { useStore } from '@/lib/store'
import { useState, useEffect } from 'react'
import { signOut } from '@/lib/supabase/session'

export default function AppNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { clearUser } = useStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleLogout = async () => {
    try {
      // Use the signOut helper which handles everything
      const result = await signOut()
      
      if (result.success) {
        // Clear store
        clearUser()
        
        // Show success message
        toast.success('Logged out successfully')
        
        // Redirect to landing page
        router.push('/landing')
        router.refresh()
      } else {
        throw new Error('Failed to sign out')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to sign out. Please try again.')
    }
  }

  const navItems = [
    { href: '/learn', label: 'Learn', icon: BookOpen },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav id="navigation" className="sticky top-0 z-50 glass border-b border-white/10" role="navigation" aria-label="Application navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg" aria-label="Zenya dashboard">
            <motion.div
              className="text-2xl font-bold text-gradient"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Zenya
            </motion.div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-4" role="menubar">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} role="menuitem" aria-current={pathname === item.href ? 'page' : undefined}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "nav-link flex items-center gap-2",
                    pathname === item.href && "text-blue-600 dark:text-blue-400"
                  )}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <item.icon className="w-4 h-4" aria-hidden="true" />
                  {item.label}
                </Button>
              </Link>
            ))}
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" role="separator" aria-orientation="vertical" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="nav-link flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              aria-label="Logout from your account"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" aria-hidden="true" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" aria-hidden="true" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden absolute top-full left-0 right-0 glass border-b border-white/10 z-50"
            >
              <div className="container mx-auto px-4 py-4">
                <nav className="flex flex-col gap-2" role="menu" aria-label="Mobile navigation">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Link href={item.href} role="menuitem" aria-current={pathname === item.href ? 'page' : undefined}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start nav-link flex items-center gap-3",
                            pathname === item.href && "bg-blue-600/10 text-blue-600 dark:text-blue-400"
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                          aria-label={`Navigate to ${item.label}`}
                        >
                          <item.icon className="w-5 h-5" aria-hidden="true" />
                          <span className="font-medium">{item.label}</span>
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: navItems.length * 0.05 }}
                    className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
                    role="separator"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-start nav-link flex items-center gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-600/10"
                      aria-label="Logout from your account"
                    >
                      <LogOut className="w-5 h-5" aria-hidden="true" />
                      <span className="font-medium">Logout</span>
                    </Button>
                  </motion.div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}