'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  LogOut, 
  User, 
  Menu, 
  X, 
  LayoutDashboard,
  Trophy,
  Users,
  MessageSquare,
  BarChart,
  Settings,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { useStore } from '@/lib/store'
import { useState, useEffect } from 'react'
import { signOut } from '@/lib/supabase/session'

export default function AppNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearUser } = useStore()
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
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/learn', label: 'Learn', icon: BookOpen },
    { href: '/practice', label: 'Practice', icon: Zap },
    { href: '/progress', label: 'Progress', icon: BarChart },
    { href: '/achievements', label: 'Achievements', icon: Trophy },
    { href: '/community', label: 'Community', icon: Users },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  // Show different nav items based on screen size
  const desktopNavItems = navItems.slice(0, 5) // Show first 5 items on desktop
  const mobileNavItems = navItems // Show all items on mobile

  return (
    <nav id="navigation" className="sticky top-0 z-50 glass border-b border-white/10" role="navigation" aria-label="Application navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg" aria-label="Zenya dashboard">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl font-bold text-gradient">Zenya</div>
              {user && (
                <Badge variant="secondary" className="text-xs">
                  Level {user.level || 1}
                </Badge>
              )}
            </motion.div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden lg:flex items-center gap-2" role="menubar">
            {desktopNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href} role="menuitem" aria-current={isActive ? 'page' : undefined}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "nav-link flex items-center gap-2 relative",
                      isActive && "text-blue-600 dark:text-blue-400"
                    )}
                    aria-label={`Navigate to ${item.label}`}
                  >
                    <item.icon className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden xl:inline">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                        layoutId="navbar-indicator"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Button>
                </Link>
              )
            })}
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" role="separator" aria-orientation="vertical" />
            
            {/* User Stats */}
            {user && (
              <div className="flex items-center gap-3 px-3">
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">XP</p>
                  <p className="text-sm font-bold text-gradient">{user.current_xp || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Streak</p>
                  <p className="text-sm font-bold flex items-center gap-1">
                    <span className="text-orange-500">{user.streak_count || 0}</span>
                    <span className="text-orange-500">🔥</span>
                  </p>
                </div>
              </div>
            )}
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" role="separator" aria-orientation="vertical" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="nav-link flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              aria-label="Logout from your account"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden xl:inline">Logout</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            {user && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-gradient">{user.current_xp || 0} XP</span>
                <span className="text-orange-500">{user.streak_count || 0}🔥</span>
              </div>
            )}
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
                {/* User Stats Card for Mobile */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Welcome back!</p>
                        <p className="text-lg font-bold">{user.name || user.email?.split('@')[0]}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Level {user.level || 1}</p>
                        <p className="text-xl font-bold text-gradient">{user.current_xp || 0} XP</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <nav className="flex flex-col gap-2" role="menu" aria-label="Mobile navigation">
                  {mobileNavItems.map((item, index) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Link href={item.href} role="menuitem" aria-current={isActive ? 'page' : undefined}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start nav-link flex items-center gap-3",
                              isActive && "bg-blue-600/10 text-blue-600 dark:text-blue-400"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label={`Navigate to ${item.label}`}
                          >
                            <item.icon className="w-5 h-5" aria-hidden="true" />
                            <span className="font-medium">{item.label}</span>
                            {/* Show badge for certain items */}
                            {item.href === '/achievements' && user && (
                              <Badge variant="secondary" className="ml-auto">
                                New
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      </motion.div>
                    )
                  })}
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: mobileNavItems.length * 0.05 }}
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