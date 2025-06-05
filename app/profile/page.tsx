'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Settings, Camera, Save, Loader, Download, Trash2, Shield, Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'
import AppNavigation from '@/components/app-navigation'
import { useStore } from '@/lib/store'

interface UserProfile {
  id: string
  email: string
  name?: string
  bio?: string
  avatar_url?: string
  learning_style?: string
  timezone?: string
  notification_preferences?: {
    email: boolean
    push: boolean
  }
  onboarding_completed?: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    learning_style: 'visual',
    timezone: 'UTC',
    emailNotifications: false,
    pushNotifications: false
  })

  const fetchProfile = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/profile')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/signin')
          return
        }
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data.profile)
      
      // Update form with existing data
      setFormData({
        name: data.profile.name || '',
        bio: data.profile.bio || '',
        learning_style: data.profile.learning_style || 'visual',
        timezone: data.profile.timezone || 'UTC',
        emailNotifications: data.profile.notification_preferences?.email || false,
        pushNotifications: data.profile.notification_preferences?.push || false
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [router, user])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: formData.name,
          bio: formData.bio,
          learning_style: formData.learning_style,
          timezone: formData.timezone,
          notification_preferences: {
            email: formData.emailNotifications,
            push: formData.pushNotifications
          }
        })
      })

      if (!response.ok) throw new Error('Failed to update profile')

      const data = await response.json()
      setProfile(data.profile)
      toast.success('Profile updated successfully!')
      
      // If this is first time completing profile, redirect to learn
      if (!profile?.onboarding_completed) {
        router.push('/learn')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <AppNavigation />
      
      <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl" role="main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Profile settings form">
            {/* Basic Information */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full p-2"
                      disabled
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile?.email || ''}
                        disabled
                        className="mt-1 opacity-60"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Learning Preferences */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Learning Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="learning_style">Preferred Learning Style</Label>
                  <Select
                    value={formData.learning_style}
                    onValueChange={(value) => setFormData({ ...formData, learning_style: value })}
                  >
                    <SelectTrigger id="learning_style" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual (Images, diagrams)</SelectItem>
                      <SelectItem value="verbal">Verbal (Words, stories)</SelectItem>
                      <SelectItem value="kinesthetic">Kinesthetic (Hands-on)</SelectItem>
                      <SelectItem value="logical">Logical (Systems, patterns)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  >
                    <SelectTrigger id="timezone" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive learning reminders and progress updates
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={formData.emailNotifications}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified about streaks and achievements
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={formData.pushNotifications}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, pushNotifications: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Data */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100 mb-3">
                    Your data belongs to you. Download or delete your data anytime.
                  </p>
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full sm:w-auto"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/user/export')
                          if (response.ok) {
                            const blob = await response.blob()
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `zenya-data-export-${Date.now()}.json`
                            a.click()
                            window.URL.revokeObjectURL(url)
                            toast.success('Your data has been downloaded')
                          } else {
                            toast.error('Failed to export data')
                          }
                        } catch (_error) {
                          toast.error('Error exporting data')
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export My Data
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2 text-red-600 dark:text-red-400">Danger Zone</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button
                    type="button"
                    variant="danger"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        if (confirm('This will permanently delete all your data including progress, achievements, and settings. Type "DELETE" to confirm.')) {
                          // Implement deletion
                          fetch('/api/user/delete', { method: 'DELETE' })
                            .then(() => {
                              toast.success('Account deleted successfully')
                              router.push('/')
                            })
                            .catch(() => toast.error('Failed to delete account'))
                        }
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    Delete Account
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      // Trigger cookie consent banner
                      localStorage.removeItem('cookiePreferences')
                      window.location.reload()
                    }}
                  >
                    <Cookie className="w-4 h-4 mr-2" aria-hidden="true" />
                    Manage Cookie Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/learn')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="btn-premium"
                aria-busy={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    <span aria-live="polite">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}