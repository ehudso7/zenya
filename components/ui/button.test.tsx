import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, type ButtonProps } from './button'

describe('Button Component', () => {
  const defaultProps = {
    children: 'Click me',
  }

  const renderButton = (props: Partial<ButtonProps> = {}) => {
    return render(<Button {...defaultProps} {...props} />)
  }

  describe('Rendering', () => {
    it('renders with default props', () => {
      renderButton()
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-indigo-600')
    })

    it('renders with all variant types', () => {
      const variants: ButtonProps['variant'][] = ['primary', 'secondary', 'ghost', 'danger', 'premium', 'glass']
      
      variants.forEach(variant => {
        const { rerender } = renderButton({ variant })
        const button = screen.getByRole('button')
        
        if (variant === 'primary') {
          expect(button).toHaveClass('from-blue-500', 'to-indigo-600')
        } else if (variant === 'secondary') {
          expect(button).toHaveClass('bg-white/70', 'dark:bg-gray-800/70')
        } else if (variant === 'ghost') {
          expect(button).toHaveClass('bg-transparent')
        } else if (variant === 'danger') {
          expect(button).toHaveClass('from-red-500', 'to-red-600')
        } else if (variant === 'premium') {
          expect(button).toHaveClass('from-blue-600', 'via-indigo-600', 'to-purple-600')
        } else if (variant === 'glass') {
          expect(button).toHaveClass('bg-white/20', 'dark:bg-gray-900/20')
        }
        
        rerender(<></>)
      })
    })

    it('renders with all size variations', () => {
      const sizes: ButtonProps['size'][] = ['sm', 'md', 'lg', 'xl']
      
      sizes.forEach(size => {
        const { rerender } = renderButton({ size })
        const button = screen.getByRole('button')
        
        if (size === 'sm') {
          expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm', 'min-h-[36px]')
        } else if (size === 'md') {
          expect(button).toHaveClass('px-4', 'py-2', 'min-h-[40px]')
        } else if (size === 'lg') {
          expect(button).toHaveClass('px-6', 'py-3', 'text-lg', 'min-h-[48px]')
        } else if (size === 'xl') {
          expect(button).toHaveClass('px-8', 'py-4', 'text-xl', 'min-h-[56px]')
        }
        
        rerender(<></>)
      })
    })

    it('renders with glow effect when glow prop is true', () => {
      renderButton({ glow: true })
      const button = screen.getByRole('button')
      expect(button).toHaveClass('animate-pulse-slow')
    })

    it('renders premium shimmer effect for premium variant', () => {
      renderButton({ variant: 'premium' })
      const shimmerElement = screen.getByRole('button').querySelector('.animate-shimmer')
      expect(shimmerElement).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      renderButton({ className: 'custom-class' })
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      renderButton({ isLoading: true })
      const spinner = screen.getByRole('button').querySelector('svg')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })

    it('disables button when isLoading is true', () => {
      renderButton({ isLoading: true })
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('shows loading spinner with text content', () => {
      renderButton({ isLoading: true, children: 'Loading...' })
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('Loading...')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      renderButton({ disabled: true })
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })

    it('disables button when both disabled and isLoading are true', () => {
      renderButton({ disabled: true, isLoading: true })
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      renderButton({ onClick: handleClick })
      const button = screen.getByRole('button')
      
      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      renderButton({ onClick: handleClick, disabled: true })
      const button = screen.getByRole('button')
      
      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      renderButton({ onClick: handleClick, isLoading: true })
      const button = screen.getByRole('button')
      
      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('handles keyboard navigation correctly', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      renderButton({ onClick: handleClick })
      const button = screen.getByRole('button')
      
      button.focus()
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<Button ref={ref}>Click me</Button>)
      
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
    })
  })

  describe('Accessibility', () => {
    it('has correct focus styles', () => {
      renderButton()
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-400')
    })

    it('supports aria attributes', () => {
      renderButton({ 'aria-label': 'Custom label', 'aria-pressed': true })
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Custom label')
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })

    it('is keyboard accessible', () => {
      renderButton()
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Button />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('')
    })

    it('handles multiple children types', () => {
      renderButton({
        children: (
          <>
            <span>Icon</span>
            Text
            <span>Badge</span>
          </>
        ),
      })
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('IconTextBadge')
    })

    it('preserves native button attributes', () => {
      renderButton({
        type: 'submit',
        form: 'test-form',
        name: 'submit-button',
        value: 'submit',
      })
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).toHaveAttribute('form', 'test-form')
      expect(button).toHaveAttribute('name', 'submit-button')
      expect(button).toHaveAttribute('value', 'submit')
    })

    it('applies all necessary transition classes', () => {
      renderButton()
      const button = screen.getByRole('button')
      expect(button).toHaveClass('transition-all', 'duration-150', 'ease-out')
    })
  })
})