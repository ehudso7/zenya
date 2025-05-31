import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'w-full px-4 py-3 rounded-xl border bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent',
            'placeholder:text-gray-500 dark:placeholder:text-gray-400',
            'transition-all duration-300',
            'hover:bg-white/80 dark:hover:bg-gray-800/80',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-200/50 dark:border-gray-700/50',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }