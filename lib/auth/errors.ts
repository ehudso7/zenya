/**
 * Auth error handling utilities
 */

export interface AuthError {
  code: string
  message: string
  userMessage: string
  action?: 'retry' | 'reset-password' | 'contact-support' | 'verify-email'
}

// Map Supabase error codes to user-friendly messages
export const AUTH_ERROR_MESSAGES: Record<string, AuthError> = {
  'invalid_credentials': {
    code: 'invalid_credentials',
    message: 'Invalid email or password',
    userMessage: 'The email or password you entered is incorrect. Please try again.',
    action: 'retry'
  },
  'user_not_found': {
    code: 'user_not_found',
    message: 'User not found',
    userMessage: 'No account found with this email address. Please sign up first.',
    action: 'retry'
  },
  'email_not_confirmed': {
    code: 'email_not_confirmed',
    message: 'Email not confirmed',
    userMessage: 'Please check your email and confirm your account before signing in.',
    action: 'verify-email'
  },
  'user_already_exists': {
    code: 'user_already_exists',
    message: 'User already exists',
    userMessage: 'An account with this email already exists. Please sign in instead.',
    action: 'retry'
  },
  'weak_password': {
    code: 'weak_password',
    message: 'Weak password',
    userMessage: 'Password must be at least 6 characters long.',
    action: 'retry'
  },
  'over_request_rate_limit': {
    code: 'over_request_rate_limit',
    message: 'Too many requests',
    userMessage: 'Too many attempts. Please wait a few minutes before trying again.',
    action: 'retry'
  },
  'invalid_email': {
    code: 'invalid_email',
    message: 'Invalid email',
    userMessage: 'Please enter a valid email address.',
    action: 'retry'
  },
  'session_not_found': {
    code: 'session_not_found',
    message: 'Session not found',
    userMessage: 'Your session has expired. Please sign in again.',
    action: 'retry'
  },
  'refresh_token_not_found': {
    code: 'refresh_token_not_found',
    message: 'Refresh token not found',
    userMessage: 'Your session has expired. Please sign in again.',
    action: 'retry'
  },
  'network_error': {
    code: 'network_error',
    message: 'Network error',
    userMessage: 'Unable to connect. Please check your internet connection and try again.',
    action: 'retry'
  },
  'server_error': {
    code: 'server_error',
    message: 'Server error',
    userMessage: 'Something went wrong on our end. Please try again later.',
    action: 'contact-support'
  }
}

/**
 * Parse auth error and return user-friendly message
 */
export function parseAuthError(error: any): AuthError {
  // Handle network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return AUTH_ERROR_MESSAGES.network_error
  }
  
  // Handle Supabase auth errors
  if (error?.message) {
    const errorMessage = error.message.toLowerCase()
    
    // Check for specific error patterns
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('invalid email or password')) {
      return AUTH_ERROR_MESSAGES.invalid_credentials
    }
    
    if (errorMessage.includes('user not found')) {
      return AUTH_ERROR_MESSAGES.user_not_found
    }
    
    if (errorMessage.includes('email not confirmed')) {
      return AUTH_ERROR_MESSAGES.email_not_confirmed
    }
    
    if (errorMessage.includes('user already registered') ||
        errorMessage.includes('user already exists')) {
      return AUTH_ERROR_MESSAGES.user_already_exists
    }
    
    if (errorMessage.includes('password should be at least')) {
      return AUTH_ERROR_MESSAGES.weak_password
    }
    
    if (errorMessage.includes('rate limit') || 
        errorMessage.includes('too many requests')) {
      return AUTH_ERROR_MESSAGES.over_request_rate_limit
    }
    
    if (errorMessage.includes('invalid email')) {
      return AUTH_ERROR_MESSAGES.invalid_email
    }
    
    if (errorMessage.includes('session') || 
        errorMessage.includes('jwt') ||
        errorMessage.includes('token')) {
      return AUTH_ERROR_MESSAGES.session_not_found
    }
  }
  
  // Check for specific error codes
  if (error?.code) {
    const errorData = AUTH_ERROR_MESSAGES[error.code]
    if (errorData) {
      return errorData
    }
  }
  
  // Default to server error
  return {
    code: 'unknown_error',
    message: error?.message || 'Unknown error',
    userMessage: error?.message || 'An unexpected error occurred. Please try again.',
    action: 'retry'
  }
}

/**
 * Format auth error for display
 */
export function formatAuthError(error: any): string {
  const authError = parseAuthError(error)
  return authError.userMessage
}

/**
 * Handle auth error with appropriate action
 */
export function handleAuthError(error: any, options?: {
  onRetry?: () => void
  onResetPassword?: () => void
  onContactSupport?: () => void
  onVerifyEmail?: () => void
}) {
  const authError = parseAuthError(error)
  
  // Log error for monitoring
  console.error('Auth error:', {
    code: authError.code,
    message: authError.message,
    originalError: error
  })
  
  // Execute action if provided
  if (authError.action && options) {
    switch (authError.action) {
      case 'retry':
        options.onRetry?.()
        break
      case 'reset-password':
        options.onResetPassword?.()
        break
      case 'contact-support':
        options.onContactSupport?.()
        break
      case 'verify-email':
        options.onVerifyEmail?.()
        break
    }
  }
  
  return authError
}