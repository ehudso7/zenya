import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AIChat } from './ai-chat'
import { apiClient } from '@/lib/api-client'
import toast from 'react-hot-toast'

// Mock dependencies
jest.mock('@/lib/api-client')
jest.mock('react-hot-toast')
jest.mock('@/lib/monitoring/client-performance', () => ({
  performanceMonitor: {
    trackUserInteraction: jest.fn(),
    trackMetric: jest.fn(),
  },
}))

const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>
const mockToast = toast as jest.Mocked<typeof toast>

describe('AIChat', () => {
  const defaultProps = {
    lessonId: 'lesson-123',
    onXPEarned: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockApiClient.mockResolvedValue({ 
      response: 'AI response', 
      xpEarned: 10 
    })
  })

  it('should render chat interface', () => {
    render(<AIChat {...defaultProps} />)
    
    expect(screen.getByText('AI Learning Assistant')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Ask a question/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('should send message on form submit', async () => {
    const user = userEvent.setup()
    render(<AIChat {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/Ask a question/i)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await user.type(input, 'What is React?')
    await user.click(sendButton)
    
    await waitFor(() => {
      expect(mockApiClient).toHaveBeenCalledWith('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'What is React?',
          lessonId: 'lesson-123',
          context: undefined,
        }),
      })
    })
  })

  it('should display AI response', async () => {
    const user = userEvent.setup()
    render(<AIChat {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/Ask a question/i)
    await user.type(input, 'Test question')
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    await waitFor(() => {
      expect(screen.getByText('AI response')).toBeInTheDocument()
    })
  })

  it('should show XP earned', async () => {
    const user = userEvent.setup()
    render(<AIChat {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/Ask a question/i)
    await user.type(input, 'Test question')
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    await waitFor(() => {
      expect(defaultProps.onXPEarned).toHaveBeenCalledWith(10)
      expect(mockToast.success).toHaveBeenCalledWith('+10 XP earned!')
    })
  })

  it('should handle errors gracefully', async () => {
    mockApiClient.mockRejectedValueOnce(new Error('API Error'))
    const user = userEvent.setup()
    
    render(<AIChat {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/Ask a question/i)
    await user.type(input, 'Test question')
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to get AI response')
    })
  })

  it('should disable input while loading', async () => {
    const user = userEvent.setup()
    render(<AIChat {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/Ask a question/i)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await user.type(input, 'Test question')
    await user.click(sendButton)
    
    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()
    
    await waitFor(() => {
      expect(input).not.toBeDisabled()
      expect(sendButton).not.toBeDisabled()
    })
  })

  it('should maintain chat history', async () => {
    const user = userEvent.setup()
    render(<AIChat {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/Ask a question/i)
    
    // First message
    await user.type(input, 'First question')
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    await waitFor(() => {
      expect(screen.getByText('First question')).toBeInTheDocument()
    })
    
    // Second message
    await user.clear(input)
    await user.type(input, 'Second question')
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    await waitFor(() => {
      expect(screen.getByText('First question')).toBeInTheDocument()
      expect(screen.getByText('Second question')).toBeInTheDocument()
    })
  })

  it('should handle quick actions', async () => {
    const user = userEvent.setup()
    render(<AIChat {...defaultProps} />)
    
    // Click on a quick action button
    const quickAction = screen.getByText('Explain this concept')
    await user.click(quickAction)
    
    await waitFor(() => {
      expect(mockApiClient).toHaveBeenCalledWith('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Explain this concept',
          lessonId: 'lesson-123',
          context: undefined,
        }),
      })
    })
  })

  it('should track performance metrics', async () => {
    const { performanceMonitor } = require('@/lib/monitoring/client-performance')
    const user = userEvent.setup()
    
    render(<AIChat {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/Ask a question/i)
    await user.type(input, 'Test question')
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    await waitFor(() => {
      expect(performanceMonitor.trackUserInteraction).toHaveBeenCalledWith(
        'ai_chat_message_sent',
        'chat',
        1
      )
    })
  })
})