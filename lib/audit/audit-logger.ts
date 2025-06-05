import { createClient } from '@supabase/supabase-js'
import { serverLogger, metrics } from '@/lib/monitoring/datadog-server'
import crypto from 'crypto'

// Audit event types
export enum AuditEventType {
  // Authentication events
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  
  // Authorization events
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REMOVED = 'ROLE_REMOVED',
  
  // Data access events
  DATA_ACCESSED = 'DATA_ACCESSED',
  DATA_CREATED = 'DATA_CREATED',
  DATA_UPDATED = 'DATA_UPDATED',
  DATA_DELETED = 'DATA_DELETED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  
  // User actions
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
  
  // Admin actions
  ADMIN_ACCESS = 'ADMIN_ACCESS',
  ADMIN_CONFIG_CHANGE = 'ADMIN_CONFIG_CHANGE',
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_REACTIVATED = 'USER_REACTIVATED',
  
  // Security events
  SECURITY_ALERT = 'SECURITY_ALERT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_ACCESS_ATTEMPT = 'INVALID_ACCESS_ATTEMPT',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  
  // Compliance events
  CONSENT_GIVEN = 'CONSENT_GIVEN',
  CONSENT_WITHDRAWN = 'CONSENT_WITHDRAWN',
  DATA_DELETION_REQUEST = 'DATA_DELETION_REQUEST',
  DATA_EXPORT_REQUEST = 'DATA_EXPORT_REQUEST',
  TERMS_ACCEPTED = 'TERMS_ACCEPTED',
}

// Audit event severity levels
export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

// Audit log entry interface
export interface AuditLogEntry {
  id?: string
  timestamp: string
  event_type: AuditEventType
  severity: AuditSeverity
  user_id?: string
  user_email?: string
  ip_address?: string
  user_agent?: string
  resource_type?: string
  resource_id?: string
  action: string
  outcome: 'SUCCESS' | 'FAILURE'
  details?: Record<string, any>
  metadata?: {
    request_id?: string
    session_id?: string
    correlation_id?: string
    duration_ms?: number
  }
  compliance_tags?: string[]
  hash?: string
}

// Initialize Supabase client for audit logs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const auditSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'audit' },
  auth: { persistSession: false },
})

export class AuditLogger {
  private static instance: AuditLogger
  private buffer: AuditLogEntry[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private readonly bufferSize = 100
  private readonly flushIntervalMs = 5000

  private constructor() {
    // Start flush interval
    this.startFlushInterval()
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'hash'>): Promise<void> {
    const timestamp = new Date().toISOString()
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp,
      id: crypto.randomUUID(),
    }

    // Generate integrity hash
    fullEntry.hash = this.generateHash(fullEntry)

    // Add to buffer
    this.buffer.push(fullEntry)

    // Log to monitoring
    serverLogger.info('Audit event', {
      event_type: entry.event_type,
      user_id: entry.user_id,
      outcome: entry.outcome,
      severity: entry.severity,
    })

    // Track metrics
    metrics.increment('audit.events', 1, [
      `type:${entry.event_type}`,
      `severity:${entry.severity}`,
      `outcome:${entry.outcome}`,
    ])

    // Flush if buffer is full
    if (this.buffer.length >= this.bufferSize) {
      await this.flush()
    }

    // For critical events, flush immediately
    if (entry.severity === AuditSeverity.CRITICAL) {
      await this.flush()
    }
  }

  private generateHash(entry: AuditLogEntry): string {
    const content = JSON.stringify({
      timestamp: entry.timestamp,
      event_type: entry.event_type,
      user_id: entry.user_id,
      action: entry.action,
      outcome: entry.outcome,
    })
    
    return crypto
      .createHash('sha256')
      .update(content + (process.env.AUDIT_HASH_SECRET || 'default-secret'))
      .digest('hex')
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush().catch(_error => {
        serverLogger.error('Failed to flush audit logs', _error)
      })
    }, this.flushIntervalMs)
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    const logsToFlush = [...this.buffer]
    this.buffer = []

    try {
      // Insert logs into audit table
      const { error } = await auditSupabase
        .from('audit_logs')
        .insert(logsToFlush)

      if (error) {
        throw error
      }

      metrics.increment('audit.flush.success', logsToFlush.length)
    } catch (_error) {
      // On failure, add logs back to buffer
      this.buffer.unshift(...logsToFlush)
      
      serverLogger.error('Failed to flush audit logs', _error instanceof Error ? _error : new Error('Unknown error'), {
        log_count: logsToFlush.length,
      })
      
      metrics.increment('audit.flush.failure', logsToFlush.length)
      
      throw _error
    }
  }

  async query(filters: {
    user_id?: string
    event_type?: AuditEventType
    start_date?: Date
    end_date?: Date
    severity?: AuditSeverity
    outcome?: 'SUCCESS' | 'FAILURE'
    limit?: number
    offset?: number
  }): Promise<AuditLogEntry[]> {
    let query = auditSupabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }

    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type)
    }

    if (filters.severity) {
      query = query.eq('severity', filters.severity)
    }

    if (filters.outcome) {
      query = query.eq('outcome', filters.outcome)
    }

    if (filters.start_date) {
      query = query.gte('timestamp', filters.start_date.toISOString())
    }

    if (filters.end_date) {
      query = query.lte('timestamp', filters.end_date.toISOString())
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1)
    }

    const { data, error } = await query

    if (error) {
      serverLogger.error('Failed to query audit logs', error)
      throw error
    }

    return data || []
  }

  async verifyIntegrity(entry: AuditLogEntry): Promise<boolean> {
    const expectedHash = this.generateHash(entry)
    return entry.hash === expectedHash
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    
    // Final flush
    this.flush().catch(_error => {
      serverLogger.error('Failed to flush audit logs on destroy', _error)
    })
  }
}

// Singleton instance
export const auditLogger = AuditLogger.getInstance()

// Middleware for automatic audit logging
export function auditMiddleware(
  eventType: AuditEventType,
  resourceType?: string
) {
  return (handler: (req: Request) => Promise<Response>) => {
    return async (req: Request): Promise<Response> => {
      const startTime = Date.now()
      const url = new URL(req.url)
      
      // Extract request metadata
      const metadata = {
        request_id: req.headers.get('x-request-id') || crypto.randomUUID(),
        session_id: req.headers.get('x-session-id') || undefined,
        correlation_id: req.headers.get('x-correlation-id') || undefined,
      }

      try {
        const response = await handler(req)
        const duration = Date.now() - startTime

        // Log successful request
        await auditLogger.log({
          event_type: eventType,
          severity: AuditSeverity.INFO,
          action: `${req.method} ${url.pathname}`,
          outcome: 'SUCCESS',
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
          resource_type: resourceType,
          metadata: {
            ...metadata,
            duration_ms: duration,
          },
          details: {
            status_code: response.status,
            method: req.method,
            path: url.pathname,
          },
        })

        return response
      } catch (_error) {
        const duration = Date.now() - startTime

        // Log failed request
        await auditLogger.log({
          event_type: eventType,
          severity: AuditSeverity.ERROR,
          action: `${req.method} ${url.pathname}`,
          outcome: 'FAILURE',
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
          resource_type: resourceType,
          metadata: {
            ...metadata,
            duration_ms: duration,
          },
          details: {
            error: _error instanceof Error ? _error.message : 'Unknown error',
            method: req.method,
            path: url.pathname,
          },
        })

        throw _error
      }
    }
  }
}

// Helper functions for common audit scenarios
export const audit = {
  login: async (userId: string, email: string, success: boolean, ip?: string) => {
    await auditLogger.log({
      event_type: AuditEventType.USER_LOGIN,
      severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
      user_id: userId,
      user_email: email,
      action: 'User login attempt',
      outcome: success ? 'SUCCESS' : 'FAILURE',
      ip_address: ip,
    })
  },

  dataAccess: async (
    userId: string,
    resourceType: string,
    resourceId: string,
    action: 'READ' | 'WRITE' | 'DELETE'
  ) => {
    await auditLogger.log({
      event_type: AuditEventType.DATA_ACCESSED,
      severity: AuditSeverity.INFO,
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      action: `Data ${action.toLowerCase()} operation`,
      outcome: 'SUCCESS',
    })
  },

  securityAlert: async (
    type: string,
    details: Record<string, any>,
    userId?: string
  ) => {
    await auditLogger.log({
      event_type: AuditEventType.SECURITY_ALERT,
      severity: AuditSeverity.CRITICAL,
      user_id: userId,
      action: `Security alert: ${type}`,
      outcome: 'FAILURE',
      details,
    })
  },

  complianceEvent: async (
    type: 'CONSENT' | 'DATA_REQUEST' | 'DELETION',
    userId: string,
    details: Record<string, any>
  ) => {
    const eventMap = {
      CONSENT: AuditEventType.CONSENT_GIVEN,
      DATA_REQUEST: AuditEventType.DATA_EXPORT_REQUEST,
      DELETION: AuditEventType.DATA_DELETION_REQUEST,
    }

    await auditLogger.log({
      event_type: eventMap[type],
      severity: AuditSeverity.INFO,
      user_id: userId,
      action: `Compliance event: ${type}`,
      outcome: 'SUCCESS',
      compliance_tags: ['GDPR', 'CCPA'],
      details,
    })
  },
}