import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MoodSelector from './mood-selector'
import type { Mood } from '@/types'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, className, ...props }: any) => (
      <button onClick={onClick} className={className} {...props}>
        {children}
      </button>
    ),
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}))

describe('MoodSelector Component', () => {
  const mockOnChange = jest.fn()
  const defaultProps = {
    value: null,
    onChange: mockOnChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderMoodSelector = (props = {}) => {
    return render(<MoodSelector {...defaultProps} {...props} />)
  }

  describe('Rendering', () => {
    it('renders all mood options', () => {
      renderMoodSelector()
      
      const moods = [
        { emoji: '😴', label: 'Low Energy' },
        { emoji: '😐', label: 'Neutral' },
        { emoji: '🙂', label: 'Good' },
        { emoji: '😄', label: 'Happy' },
        { emoji: '🔥', label: 'Energized' },
      ]
      
      moods.forEach(mood => {
        const button = screen.getByRole('button', { name: new RegExp(mood.label) })
        expect(button).toBeInTheDocument()
        expect(button).toHaveTextContent(mood.emoji)
        expect(button).toHaveTextContent(mood.label)
      })
    })

    it('renders with correct initial styles', () => {
      renderMoodSelector()
      const buttons = screen.getAllByRole('button')
      
      buttons.forEach(button => {
        expect(button).toHaveClass('mood-button')
        expect(button).toHaveClass('bg-white/50', 'dark:bg-gray-800/50')
        expect(button).toHaveClass('border', 'border-gray-200/50')
      })
    })

    it('shows selected state for active mood', () => {
      const selectedMood: Mood = '😄'
      renderMoodSelector({ value: selectedMood })
      
      const selectedButton = screen.getByRole('button', { name: /Happy/ })
      expect(selectedButton).toHaveClass('selected')
      
      // Check that other buttons are not selected
      const otherButtons = screen.getAllByRole('button').filter(btn => !btn.textContent?.includes('😄'))
      otherButtons.forEach(button => {
        expect(button).not.toHaveClass('selected')
      })
    })

    it('renders selection indicator for selected mood', () => {
      renderMoodSelector({ value: '🙂' })
      
      const selectedButton = screen.getByRole('button', { name: /Good/ })
      const selectionIndicator = selectedButton.querySelector('.ring-2.ring-blue-400')
      expect(selectionIndicator).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onChange when a mood is clicked', async () => {
      const user = userEvent.setup()
      renderMoodSelector()
      
      const happyButton = screen.getByRole('button', { name: /Happy/ })
      await user.click(happyButton)
      
      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith('😄')
    })

    it('calls onChange when different moods are clicked sequentially', async () => {
      const user = userEvent.setup()
      renderMoodSelector()
      
      const neutralButton = screen.getByRole('button', { name: /Neutral/ })
      const energizedButton = screen.getByRole('button', { name: /Energized/ })
      
      await user.click(neutralButton)
      expect(mockOnChange).toHaveBeenCalledWith('😐')
      
      await user.click(energizedButton)
      expect(mockOnChange).toHaveBeenCalledWith('🔥')
      
      expect(mockOnChange).toHaveBeenCalledTimes(2)
    })

    it('allows clicking on already selected mood', async () => {
      const user = userEvent.setup()
      renderMoodSelector({ value: '🙂' })
      
      const goodButton = screen.getByRole('button', { name: /Good/ })
      await user.click(goodButton)
      
      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith('🙂')
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      renderMoodSelector()
      
      const firstButton = screen.getByRole('button', { name: /Low Energy/ })
      firstButton.focus()
      
      await user.keyboard('{Enter}')
      expect(mockOnChange).toHaveBeenCalledWith('😴')
      
      await user.tab()
      await user.keyboard(' ')
      expect(mockOnChange).toHaveBeenCalledWith('😐')
    })

    it('handles rapid successive clicks', async () => {
      const user = userEvent.setup()
      renderMoodSelector()
      
      const buttons = screen.getAllByRole('button')
      
      // Click all buttons rapidly
      for (const button of buttons) {
        await user.click(button)
      }
      
      expect(mockOnChange).toHaveBeenCalledTimes(5)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderMoodSelector()
      
      const moods = [
        { emoji: '😴', label: 'Low Energy' },
        { emoji: '😐', label: 'Neutral' },
        { emoji: '🙂', label: 'Good' },
        { emoji: '😄', label: 'Happy' },
        { emoji: '🔥', label: 'Energized' },
      ]
      
      moods.forEach(mood => {
        const emoji = screen.getByLabelText(mood.label)
        expect(emoji).toBeInTheDocument()
        expect(emoji).toHaveTextContent(mood.emoji)
      })
    })

    it('has correct focus styles', () => {
      renderMoodSelector()
      const buttons = screen.getAllByRole('button')
      
      buttons.forEach(button => {
        expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-400')
      })
    })

    it('is keyboard navigable', async () => {
      const user = userEvent.setup()
      renderMoodSelector()
      
      const buttons = screen.getAllByRole('button')
      
      // Tab through all buttons
      for (let i = 0; i < buttons.length; i++) {
        await user.tab()
        expect(buttons[i]).toHaveFocus()
      }
    })

    it('supports screen readers with proper text labels', () => {
      renderMoodSelector()
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const label = button.querySelector('.text-sm')
        expect(label).toBeInTheDocument()
        expect(label).toHaveClass('text-gray-700', 'dark:text-gray-300')
      })
    })
  })

  describe('Visual States', () => {
    it('applies hover styles correctly', () => {
      renderMoodSelector()
      const button = screen.getByRole('button', { name: /Good/ })
      
      expect(button).toHaveClass('md:hover:bg-white/70', 'dark:md:hover:bg-gray-800/70')
    })

    it('applies active styles correctly', () => {
      renderMoodSelector()
      const button = screen.getByRole('button', { name: /Good/ })
      
      expect(button).toHaveClass('active:bg-white/80', 'dark:active:bg-gray-800/80')
    })

    it('has touch-manipulation for mobile optimization', () => {
      renderMoodSelector()
      const buttons = screen.getAllByRole('button')
      
      buttons.forEach(button => {
        expect(button).toHaveClass('touch-manipulation')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined onChange gracefully', () => {
      const { rerender } = render(<MoodSelector value={null} onChange={undefined as any} />)
      
      const button = screen.getByRole('button', { name: /Good/ })
      fireEvent.click(button)
      
      // Should not throw error
      expect(() => rerender(<MoodSelector value={null} onChange={undefined as any} />)).not.toThrow()
    })

    it('updates selection when value prop changes', () => {
      const { rerender } = renderMoodSelector({ value: '😴' })
      
      let selectedButton = screen.getByRole('button', { name: /Low Energy/ })
      expect(selectedButton).toHaveClass('selected')
      
      rerender(<MoodSelector {...defaultProps} value="🔥" />)
      
      selectedButton = screen.getByRole('button', { name: /Low Energy/ })
      expect(selectedButton).not.toHaveClass('selected')
      
      const newSelectedButton = screen.getByRole('button', { name: /Energized/ })
      expect(newSelectedButton).toHaveClass('selected')
    })

    it('maintains consistent layout with different viewport sizes', () => {
      renderMoodSelector()
      
      const container = screen.getAllByRole('button')[0].parentElement
      expect(container).toHaveClass('flex', 'flex-wrap', 'justify-center', 'gap-4')
    })

    it('handles null value correctly', () => {
      renderMoodSelector({ value: null })
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toHaveClass('selected')
      })
    })
  })

  describe('Layout and Spacing', () => {
    it('has proper container structure', () => {
      const { container } = renderMoodSelector()
      
      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'space-y-6')
    })

    it('maintains minimum button width', () => {
      renderMoodSelector()
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('min-w-[100px]')
      })
    })

    it('has proper padding on buttons', () => {
      renderMoodSelector()
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('p-6')
      })
    })
  })
})