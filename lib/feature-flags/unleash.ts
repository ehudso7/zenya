import { UnleashClient, IToggle } from 'unleash-proxy-client'
import { Context as UnleashContext } from 'unleash-proxy-client'
import React, { Fragment } from 'react'

// Feature flag names as constants for type safety
export const FEATURES = {
  // Core features
  AI_PROVIDERS: 'ai-providers',
  ADVANCED_ANALYTICS: 'advanced-analytics',
  GAMIFICATION: 'gamification',
  SOCIAL_LEARNING: 'social-learning',
  OFFLINE_MODE: 'offline-mode',
  
  // AI features
  GPT4_TURBO: 'gpt4-turbo',
  CLAUDE_3: 'claude-3',
  CUSTOM_AI_MODELS: 'custom-ai-models',
  VOICE_INTERACTION: 'voice-interaction',
  
  // Learning features
  ADAPTIVE_CURRICULUM: 'adaptive-curriculum',
  PEER_LEARNING: 'peer-learning',
  STUDY_GROUPS: 'study-groups',
  CERTIFICATES: 'certificates',
  
  // Platform features
  DARK_MODE: 'dark-mode',
  BETA_FEATURES: 'beta-features',
  NEW_ONBOARDING: 'new-onboarding',
  PREMIUM_TIER: 'premium-tier',
  
  // Experiments
  EXPERIMENT_NEW_UI: 'experiment-new-ui',
  EXPERIMENT_AI_TUTOR_V2: 'experiment-ai-tutor-v2',
  EXPERIMENT_FASTER_LOADING: 'experiment-faster-loading',
} as const

export type FeatureName = typeof FEATURES[keyof typeof FEATURES]

// Unleash client singleton
let unleashClient: UnleashClient | null = null

// Initialize Unleash client
export function initializeUnleash() {
  if (typeof window === 'undefined') return null
  
  if (!process.env.NEXT_PUBLIC_UNLEASH_URL || !process.env.NEXT_PUBLIC_UNLEASH_CLIENT_KEY) {
    // Unleash configuration missing, feature flags disabled
    return null
  }
  
  if (!unleashClient) {
    unleashClient = new UnleashClient({
      url: process.env.NEXT_PUBLIC_UNLEASH_URL,
      clientKey: process.env.NEXT_PUBLIC_UNLEASH_CLIENT_KEY,
      appName: 'zenya',
      environment: process.env.NODE_ENV || 'development',
      refreshInterval: 15, // Refresh flags every 15 seconds
      disableMetrics: process.env.NODE_ENV === 'development',
    })
    
    // Start the client
    unleashClient.start()
    
    // Set up event listeners
    unleashClient.on('ready', () => {
      // Feature flags loaded
    })
    
    unleashClient.on('error', (error) => {
      // Unleash error - will be monitored by error tracking
    })
  }
  
  return unleashClient
}

// Update user context
export function updateUserContext(userId?: string, properties?: Record<string, string>) {
  const context: UnleashContext = {
    userId: userId || 'anonymous',
    sessionId: getSessionId(),
    properties: {
      ...properties,
      platform: 'web',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    },
  }
  
  unleashClient?.updateContext(context)
}

// Check if a feature is enabled
export function isFeatureEnabled(
  feature: FeatureName,
  defaultValue = false
): boolean {
  if (!unleashClient) {
    return defaultValue
  }
  
  return unleashClient.isEnabled(feature, defaultValue)
}

// Get feature variant (for A/B testing)
export function getFeatureVariant(
  feature: FeatureName,
  defaultVariant = 'control'
): string {
  if (!unleashClient) {
    return defaultVariant
  }
  
  const variant = unleashClient.getVariant(feature)
  return variant.enabled ? variant.name : defaultVariant
}

// Get feature configuration
export function getFeatureConfig<T = any>(
  feature: FeatureName,
  defaultConfig?: T
): T | undefined {
  if (!unleashClient) {
    return defaultConfig
  }
  
  const variant = unleashClient.getVariant(feature)
  if (variant.enabled && variant.payload) {
    try {
      return JSON.parse(variant.payload.value) as T
    } catch {
      return defaultConfig
    }
  }
  
  return defaultConfig
}

// React hook for feature flags
export function useFeatureFlag(
  feature: FeatureName,
  defaultValue = false
): boolean {
  const [isEnabled, setIsEnabled] = React.useState(() => 
    isFeatureEnabled(feature, defaultValue)
  )
  
  React.useEffect(() => {
    if (!unleashClient) return
    
    const checkFlag = () => {
      setIsEnabled(isFeatureEnabled(feature, defaultValue))
    }
    
    // Check immediately
    checkFlag()
    
    // Listen for updates
    unleashClient.on('update', checkFlag)
    
    return () => {
      unleashClient?.off('update', checkFlag)
    }
  }, [feature, defaultValue])
  
  return isEnabled
}

// React hook for feature variants
export function useFeatureVariant(
  feature: FeatureName,
  defaultVariant = 'control'
): string {
  const [variant, setVariant] = React.useState(() => 
    getFeatureVariant(feature, defaultVariant)
  )
  
  React.useEffect(() => {
    if (!unleashClient) return
    
    const checkVariant = () => {
      setVariant(getFeatureVariant(feature, defaultVariant))
    }
    
    // Check immediately
    checkVariant()
    
    // Listen for updates
    unleashClient.on('update', checkVariant)
    
    return () => {
      unleashClient?.off('update', checkVariant)
    }
  }, [feature, defaultVariant])
  
  return variant
}

// Server-side feature flags
export async function getServerFeatureFlags(
  userId?: string,
  context?: Record<string, string>
): Promise<Record<FeatureName, boolean>> {
  if (!process.env.UNLEASH_API_URL || !process.env.UNLEASH_API_TOKEN) {
    // Server-side Unleash configuration missing
    return {} as Record<FeatureName, boolean>
  }
  
  try {
    const response = await fetch(
      `${process.env.UNLEASH_API_URL}/client/features`,
      {
        headers: {
          Authorization: process.env.UNLEASH_API_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch feature flags')
    }
    
    const data = await response.json()
    const flags: Record<string, boolean> = {}
    
    // Process each feature
    data.features.forEach((toggle: IToggle) => {
      // Simple enabled check for now
      // In production, you'd evaluate strategies properly
      flags[toggle.name] = toggle.enabled
    })
    
    return flags as Record<FeatureName, boolean>
  } catch (_error) {
    // Error fetching server feature flags
    return {} as Record<FeatureName, boolean>
  }
}

// Helper to get session ID
function getSessionId(): string {
  const key = 'zenya_session_id'
  let sessionId = sessionStorage.getItem(key)
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(key, sessionId)
  }
  
  return sessionId
}

// Feature flag component wrapper
interface FeatureFlagProps {
  feature: FeatureName
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function FeatureFlag({ feature, fallback = null, children }: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(feature)
  
  return isEnabled ? <Fragment>{children}</Fragment> : <Fragment>{fallback}</Fragment>
}

// A/B test component wrapper
interface ABTestProps {
  feature: FeatureName
  variants: Record<string, React.ReactNode>
  defaultVariant?: string
}

export function ABTest({ feature, variants, defaultVariant = 'control' }: ABTestProps) {
  const variant = useFeatureVariant(feature, defaultVariant)
  
  return <Fragment>{variants[variant] || variants[defaultVariant] || null}</Fragment>
}

// Import React for hooks
import * as React from 'react'