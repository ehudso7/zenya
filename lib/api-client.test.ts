import { apiClient, api, debounce, useNetworkStatus } from './api-client'
import { toast } from 'react-hot-toast'

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('apiClient', () => {
    describe('Successful Requests', () => {
      it('should make a successful GET request', async () => {
        const mockResponse = { data: 'test' }
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => 'application/json',
          },
          json: async () => mockResponse,
        })

        const result = await apiClient('/api/test')

        expect(global.fetch).toHaveBeenCalledWith('/api/test', {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        expect(result).toEqual(mockResponse)
        expect(toast.error).not.toHaveBeenCalled()
      })

      it('should handle non-JSON responses', async () => {
        const mockText = 'Plain text response'
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => 'text/plain',
          },
          text: async () => mockText,
        })

        const result = await apiClient('/api/text')

        expect(result).toBe(mockText)
      })

      it('should merge custom headers', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => 'application/json',
          },
          json: async () => ({}),
        })

        await apiClient('/api/test', {
          headers: {
            'Authorization': 'Bearer token',
            'X-Custom-Header': 'value',
          },
        })

        expect(global.fetch).toHaveBeenCalledWith('/api/test', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token',
            'X-Custom-Header': 'value',
          },
        })
      })
    })

    describe('Error Handling', () => {
      it('should handle 4xx errors without retry', async () => {
        const errorResponse = { error: 'Bad Request' }
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          headers: {
            get: () => 'application/json',
          },
          json: async () => errorResponse,
        })

        await expect(apiClient('/api/test')).rejects.toThrow()
        expect(global.fetch).toHaveBeenCalledTimes(1)
        expect(toast.error).toHaveBeenCalledWith('Bad Request')
      })

      it('should handle 5xx errors with retry', async () => {
        ;(global.fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: false,
            status: 500,
            headers: {
              get: () => 'application/json',
            },
            json: async () => ({ message: 'Server Error' }),
          })
          .mockResolvedValueOnce({
            ok: false,
            status: 502,
            headers: {
              get: () => 'application/json',
            },
            json: async () => ({ error: 'Bad Gateway' }),
          })
          .mockResolvedValueOnce({
            ok: true,
            headers: {
              get: () => 'application/json',
            },
            json: async () => ({ success: true }),
          })

        const result = await apiClient('/api/test', { retryDelay: 10 })

        expect(global.fetch).toHaveBeenCalledTimes(3)
        expect(result).toEqual({ success: true })
        expect(toast.error).not.toHaveBeenCalled()
      })

      it('should handle network errors', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))

        await expect(apiClient('/api/test', { retryDelay: 10 })).rejects.toThrow('Failed to fetch')
        expect(global.fetch).toHaveBeenCalledTimes(3)
        expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection.')
      })

      it('should handle non-JSON error responses', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 503,
          headers: {
            get: () => 'text/plain',
          },
          text: async () => 'Service Unavailable',
        })

        await expect(apiClient('/api/test', { retries: 1 })).rejects.toThrow()
        expect(toast.error).toHaveBeenCalledWith('Service Unavailable')
      })

      it('should not show toast when showErrorToast is false', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Test error'))

        await expect(
          apiClient('/api/test', { retries: 1, showErrorToast: false })
        ).rejects.toThrow()
        expect(toast.error).not.toHaveBeenCalled()
      })

      it('should handle generic errors', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Unknown error'))

        await expect(apiClient('/api/test', { retries: 1 })).rejects.toThrow()
        expect(toast.error).toHaveBeenCalledWith('Something went wrong. Please try again.')
      })
    })

    describe('Retry Logic', () => {
      it('should respect custom retry count', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

        await expect(
          apiClient('/api/test', { retries: 5, retryDelay: 10 })
        ).rejects.toThrow()
        expect(global.fetch).toHaveBeenCalledTimes(5)
      })

      it('should use exponential backoff for retries', async () => {
        const delays: number[] = []
        const originalSetTimeout = global.setTimeout
        global.setTimeout = jest.fn((fn: any, delay?: number) => {
          delays.push(delay || 0)
          return originalSetTimeout(fn, 0) // Execute immediately for testing
        }) as any

        ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

        await expect(
          apiClient('/api/test', { retries: 4, retryDelay: 100 })
        ).rejects.toThrow()

        expect(delays).toEqual([100, 200, 400]) // Exponential backoff
        global.setTimeout = originalSetTimeout
      })

      it('should not retry on the last attempt', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

        await expect(
          apiClient('/api/test', { retries: 1 })
        ).rejects.toThrow()
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Convenience Methods', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => ({ success: true }),
      })
    })

    it('should make GET requests', async () => {
      await api.get('/api/test')

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should make POST requests with data', async () => {
      const data = { name: 'test' }
      await api.post('/api/test', data)

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should make POST requests without data', async () => {
      await api.post('/api/test')

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        body: undefined,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should make PUT requests', async () => {
      const data = { id: 1, name: 'updated' }
      await api.put('/api/test/1', data)

      expect(global.fetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should make DELETE requests', async () => {
      await api.delete('/api/test/1')

      expect(global.fetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should pass through custom options', async () => {
      await api.get('/api/test', {
        headers: { 'X-Custom': 'value' },
        credentials: 'include',
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom': 'value',
        },
        credentials: 'include',
      })
    })
  })

  describe('debounce', () => {
    jest.useFakeTimers()

    it('should debounce function calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 300)

      debouncedFn('first')
      debouncedFn('second')
      debouncedFn('third')

      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(300)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('third')
    })

    it('should preserve this context', () => {
      const obj = {
        value: 42,
        getValue: jest.fn(function(this: any) {
          return this.value
        }),
      }

      const debouncedGetValue = debounce(obj.getValue, 100)
      debouncedGetValue.call(obj)

      jest.advanceTimersByTime(100)

      expect(obj.getValue).toHaveBeenCalledTimes(1)
      expect(obj.getValue.mock.instances[0]).toBe(obj)
    })

    it('should handle multiple arguments', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 200)

      debouncedFn(1, 'two', { three: 3 })

      jest.advanceTimersByTime(200)

      expect(mockFn).toHaveBeenCalledWith(1, 'two', { three: 3 })
    })

    it('should cancel previous timeouts', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 500)

      debouncedFn('first')
      jest.advanceTimersByTime(300)
      debouncedFn('second')
      jest.advanceTimersByTime(300)
      debouncedFn('third')
      jest.advanceTimersByTime(500)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('third')
    })
  })

  describe('useNetworkStatus', () => {
    let originalWindow: any
    let addEventListenerSpy: jest.Mock
    let mockNavigator: any

    beforeEach(() => {
      originalWindow = global.window
      addEventListenerSpy = jest.fn()
      mockNavigator = { onLine: true }

      global.window = {
        navigator: mockNavigator,
        addEventListener: addEventListenerSpy,
      } as any
    })

    afterEach(() => {
      global.window = originalWindow
    })

    it('should return online status when online', () => {
      mockNavigator.onLine = true
      const { isOnline } = useNetworkStatus()
      expect(isOnline).toBe(true)
    })

    it('should return offline status when offline', () => {
      mockNavigator.onLine = false
      const { isOnline } = useNetworkStatus()
      expect(isOnline).toBe(false)
    })

    it('should register event listeners', () => {
      useNetworkStatus()

      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
    })

    it('should show success toast when coming online', () => {
      useNetworkStatus()

      const onlineHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'online'
      )[1]
      onlineHandler()

      expect(toast.success).toHaveBeenCalledWith('Back online!')
    })

    it('should show error toast when going offline', () => {
      useNetworkStatus()

      const offlineHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'offline'
      )[1]
      offlineHandler()

      expect(toast.error).toHaveBeenCalledWith('You are offline. Some features may not work.')
    })

    it('should handle server-side rendering', () => {
      global.window = undefined as any
      
      const { isOnline } = useNetworkStatus()
      
      expect(isOnline).toBe(true)
      expect(addEventListenerSpy).not.toHaveBeenCalled()
    })
  })
})