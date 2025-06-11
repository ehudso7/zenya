/**
 * Production-grade circuit breaker for AI provider management
 * Implements the Circuit Breaker pattern to handle AI provider failures gracefully
 */

export interface CircuitBreakerConfig {
  failureThreshold: number    // Number of failures before opening circuit
  timeout: number            // Time in ms to wait before attempting to close circuit
  resetTimeout: number       // Time in ms to wait in half-open state
  monitoringWindow: number   // Time window in ms for failure rate calculation
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open'
  failures: number
  lastFailureTime?: number
  nextRetryTime?: number
  requestCount: number
  successCount: number
  windowStart: number
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig
  private state: CircuitBreakerState
  private readonly name: string

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name
    this.config = {
      failureThreshold: 5,
      timeout: 60000,           // 1 minute
      resetTimeout: 30000,      // 30 seconds
      monitoringWindow: 120000, // 2 minutes
      ...config
    }

    this.state = {
      state: 'closed',
      failures: 0,
      requestCount: 0,
      successCount: 0,
      windowStart: Date.now()
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new Error(`Circuit breaker ${this.name} is OPEN. Service unavailable.`)
    }

    const start = Date.now()
    
    try {
      this.onCallStart()
      const result = await operation()
      this.onCallSuccess(Date.now() - start)
      return result
    } catch (error) {
      this.onCallFailure(Date.now() - start)
      throw error
    }
  }

  private canExecute(): boolean {
    const now = Date.now()
    this.updateWindow(now)

    switch (this.state.state) {
      case 'closed':
        return true
      
      case 'open':
        if (this.state.nextRetryTime && now >= this.state.nextRetryTime) {
          this.state.state = 'half-open'
          return true
        }
        return false
      
      case 'half-open':
        return true
      
      default:
        return false
    }
  }

  private onCallStart(): void {
    this.state.requestCount++
  }

  private onCallSuccess(duration: number): void {
    this.state.successCount++
    
    if (this.state.state === 'half-open') {
      // Reset to closed state after successful call in half-open
      this.reset()
    }
    
    this.logMetric('success', duration)
  }

  private onCallFailure(duration: number): void {
    this.state.failures++
    this.state.lastFailureTime = Date.now()
    
    if (this.shouldTripCircuit()) {
      this.trip()
    }
    
    this.logMetric('failure', duration)
  }

  private shouldTripCircuit(): boolean {
    // Don't trip if we haven't had enough requests
    if (this.state.requestCount < this.config.failureThreshold) {
      return false
    }

    // Calculate failure rate within the monitoring window
    const failureRate = this.state.failures / this.state.requestCount
    const threshold = this.config.failureThreshold / this.state.requestCount
    
    return failureRate >= threshold
  }

  private trip(): void {
    this.state.state = 'open'
    this.state.nextRetryTime = Date.now() + this.config.timeout
    
    console.warn(`Circuit breaker ${this.name} TRIPPED - too many failures`, {
      failures: this.state.failures,
      requestCount: this.state.requestCount,
      failureRate: (this.state.failures / this.state.requestCount * 100).toFixed(2) + '%'
    })
  }

  private reset(): void {
    this.state.state = 'closed'
    this.state.failures = 0
    this.state.requestCount = 0
    this.state.successCount = 0
    this.state.lastFailureTime = undefined
    this.state.nextRetryTime = undefined
    this.state.windowStart = Date.now()
    
    console.warn(`Circuit breaker ${this.name} RESET - service recovered`)
  }

  private updateWindow(now: number): void {
    // Reset counters if monitoring window has passed
    if (now - this.state.windowStart > this.config.monitoringWindow) {
      this.state.requestCount = 0
      this.state.successCount = 0
      this.state.failures = 0
      this.state.windowStart = now
    }
  }

  private logMetric(type: 'success' | 'failure', duration: number): void {
    // In production, send to monitoring system
    const metric = {
      circuitBreaker: this.name,
      type,
      duration,
      state: this.state.state,
      timestamp: new Date().toISOString()
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('Circuit Breaker Metric:', metric)
    }
  }

  // Public methods for monitoring
  public getState(): CircuitBreakerState & { name: string } {
    return {
      ...this.state,
      name: this.name
    }
  }

  public getHealthScore(): number {
    if (this.state.requestCount === 0) return 1.0
    return this.state.successCount / this.state.requestCount
  }

  public isHealthy(): boolean {
    return this.state.state === 'closed' && this.getHealthScore() > 0.8
  }

  public forceOpen(): void {
    this.state.state = 'open'
    this.state.nextRetryTime = Date.now() + this.config.timeout
    console.warn(`Circuit breaker ${this.name} FORCED OPEN`)
  }

  public forceClose(): void {
    this.reset()
    console.warn(`Circuit breaker ${this.name} FORCED CLOSED`)
  }
}

/**
 * Circuit breaker registry for managing multiple AI providers
 */
export class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>()

  public getOrCreate(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, config))
    }
    return this.breakers.get(name)!
  }

  public getAll(): CircuitBreaker[] {
    return Array.from(this.breakers.values())
  }

  public getHealthReport(): Record<string, any> {
    const report: Record<string, any> = {}
    
    for (const [name, breaker] of this.breakers) {
      report[name] = {
        ...breaker.getState(),
        healthScore: breaker.getHealthScore(),
        isHealthy: breaker.isHealthy()
      }
    }
    
    return report
  }

  public getHealthyProviders(): string[] {
    return Array.from(this.breakers.entries())
      .filter(([_, breaker]) => breaker.isHealthy())
      .map(([name]) => name)
  }

  public reset(name?: string): void {
    if (name) {
      const breaker = this.breakers.get(name)
      if (breaker) {
        breaker.forceClose()
      }
    } else {
      // Reset all breakers
      for (const breaker of this.breakers.values()) {
        breaker.forceClose()
      }
    }
  }
}

// Global circuit breaker registry
export const circuitBreakerRegistry = new CircuitBreakerRegistry()

// Pre-configured circuit breakers for different AI providers
export const aiProviderBreakers = {
  openai: circuitBreakerRegistry.getOrCreate('openai', {
    failureThreshold: 3,
    timeout: 30000,      // 30 seconds
    resetTimeout: 15000, // 15 seconds
  }),
  
  anthropic: circuitBreakerRegistry.getOrCreate('anthropic', {
    failureThreshold: 3,
    timeout: 30000,
    resetTimeout: 15000,
  }),
  
  cohere: circuitBreakerRegistry.getOrCreate('cohere', {
    failureThreshold: 5,  // More tolerant for free tier
    timeout: 60000,       // 1 minute
    resetTimeout: 30000,  // 30 seconds
  }),
  
  huggingface: circuitBreakerRegistry.getOrCreate('huggingface', {
    failureThreshold: 5,
    timeout: 60000,
    resetTimeout: 30000,
  }),
}

/**
 * Retry mechanism with exponential backoff
 */
export class RetryManager {
  private maxRetries: number
  private baseDelay: number
  private maxDelay: number

  constructor(maxRetries = 3, baseDelay = 1000, maxDelay = 10000) {
    this.maxRetries = maxRetries
    this.baseDelay = baseDelay
    this.maxDelay = maxDelay
  }

  async execute<T>(
    operation: () => Promise<T>,
    shouldRetry: (error: any, attempt: number) => boolean = () => true
  ): Promise<T> {
    let lastError: any
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt === this.maxRetries || !shouldRetry(error, attempt)) {
          throw error
        }
        
        const delay = Math.min(
          this.baseDelay * Math.pow(2, attempt - 1),
          this.maxDelay
        )
        
        await this.delay(delay)
      }
    }
    
    throw lastError
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const retryManager = new RetryManager()