/**
 * Zenya Fine-Tuned Model Configuration
 * Manages model selection, feature flags, and A/B testing
 */

export interface ZenyaModelConfig {
  fineTunedModelId: string
  enableFineTuned: boolean
  minUsageScore: number
  rolloutPercentage: number
}

export interface UserContext {
  id: string
  usageScore?: number
  segment?: 'power-user' | 'regular' | 'new'
  persona?: string
  abTestGroup?: string
}

export class ZenyaModelSelector {
  private config: ZenyaModelConfig

  constructor() {
    this.config = {
      fineTunedModelId: process.env.ZENYA_FINE_TUNED_MODEL || 'gpt-3.5-turbo',
      enableFineTuned: process.env.ENABLE_FINE_TUNED_MODEL === 'true',
      minUsageScore: parseInt(process.env.FINE_TUNED_MODEL_MIN_USAGE_SCORE || '80'),
      rolloutPercentage: parseInt(process.env.FINE_TUNED_MODEL_ROLLOUT_PERCENTAGE || '25')
    }
  }

  /**
   * Determines which model to use based on user context and feature flags
   */
  getModel(user?: UserContext): string {
    // If fine-tuned model is disabled globally, use default
    if (!this.config.enableFineTuned) {
      return 'gpt-3.5-turbo'
    }

    // If no user context, use default
    if (!user) {
      return 'gpt-3.5-turbo'
    }

    // Check if user meets criteria for fine-tuned model
    const useFineTuned = this.shouldUseFineTunedModel(user)
    
    return useFineTuned ? this.config.fineTunedModelId : 'gpt-3.5-turbo'
  }

  /**
   * Determines if a user should use the fine-tuned model
   */
  private shouldUseFineTunedModel(user: UserContext): boolean {
    // Check persona
    if (user.persona !== 'zenya') {
      return false
    }

    // Check usage score
    const usageScore = user.usageScore || 0
    if (usageScore < this.config.minUsageScore) {
      return false
    }

    // Check if user is in rollout percentage
    if (!this.isInRolloutGroup(user)) {
      return false
    }

    // Power users always get fine-tuned model
    if (user.segment === 'power-user') {
      return true
    }

    return true
  }

  /**
   * Determines if user is in the rollout group for A/B testing
   */
  private isInRolloutGroup(user: UserContext): boolean {
    // If already assigned to a test group, use that
    if (user.abTestGroup === 'fine-tuned') {
      return true
    }
    if (user.abTestGroup === 'control') {
      return false
    }

    // Otherwise, use deterministic random assignment based on user ID
    const hash = this.hashUserId(user.id)
    const percentage = (hash % 100) + 1
    
    return percentage <= this.config.rolloutPercentage
  }

  /**
   * Simple hash function for consistent user assignment
   */
  private hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Gets the current configuration
   */
  getConfig(): ZenyaModelConfig {
    return { ...this.config }
  }

  /**
   * Updates configuration (useful for runtime changes)
   */
  updateConfig(updates: Partial<ZenyaModelConfig>): void {
    this.config = { ...this.config, ...updates }
  }
}

// Export singleton instance
export const zenyaModelSelector = new ZenyaModelSelector()