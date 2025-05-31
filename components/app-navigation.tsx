'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, BookOpen, BarChart3, Brain, LogOut, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useStore } from '@/lib/store'

export default function AppNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user, clearUser } = useStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearUser()
    toast.success('Logged out successfully')
    router.push('/landing')
  }

  const navItems = [
    { href: '/learn', label: 'Learn', icon: BookOpen },
    { href: '/progress', label: 'Progress', icon: BarChart3 },
    { href: '/insights', label: 'Insights', icon: Brain },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              className="text-2xl font-bold text-gradient"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Zenya
            </motion.div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "nav-link flex items-center gap-2",
                    pathname === item.href && "text-blue-600 dark:text-blue-400"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="nav-link flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}