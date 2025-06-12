import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  glow?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, glow = false, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:shadow-md active:scale-[0.98]',
      secondary: 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-lg hover:-translate-y-0.5 active:bg-white/60 dark:active:bg-gray-800/60 active:scale-[0.98]',
      ghost: 'bg-transparent hover:bg-gray-100/50 dark:hover:bg-gray-800/50 active:bg-gray-100/70 dark:active:bg-gray-800/70',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 active:shadow-md active:scale-[0.98]',
      premium: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-premium hover:shadow-2xl active:shadow-lg active:scale-[0.98] overflow-hidden',
      glass: 'bg-white/20 dark:bg-gray-900/20 backdrop-blur-lg border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-900/30 hover:shadow-xl hover:shadow-white/10 hover:-translate-y-0.5 active:bg-white/40 dark:active:bg-gray-900/40 active:scale-[0.98]',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2 min-h-[40px]',
      lg: 'px-6 py-3 text-lg min-h-[48px]',
      xl: 'px-8 py-4 text-xl min-h-[56px]',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl font-medium',
          'transition-all duration-150 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:pointer-events-none',
          'transform-gpu will-change-transform',
          'select-none cursor-pointer',
          'touch-action-manipulation',
          'touch-manipulation',
          '-webkit-tap-highlight-color-transparent',
          'active:transition-none',
          variants[variant],
          sizes[size],
          glow && 'animate-pulse-slow',
          className
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Loading</span>
          </>
        )}
        {children}
        {variant === 'premium' && (
          <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }