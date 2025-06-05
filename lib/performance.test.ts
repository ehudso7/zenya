import { measurePerformance, debounce, throttle, memoize, lazy } from './performance-utils'

describe('Performance Utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('measurePerformance', () => {
    it('should measure execution time of sync functions', async () => {
      const mockFn = jest.fn(() => {
        let sum = 0
        for (let i = 0; i < 1000; i++) {
          sum += i
        }
        return sum
      })

      const measured = measurePerformance(mockFn, 'testFunction')
      const result = measured()

      expect(result).toBe(499500)
      expect(mockFn).toHaveBeenCalled()
    })

    it('should measure execution time of async functions', async () => {
      const mockAsyncFn = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return 'async result'
      })

      const measured = measurePerformance(mockAsyncFn, 'asyncFunction')
      const resultPromise = measured()

      jest.advanceTimersByTime(100)
      const result = await resultPromise

      expect(result).toBe('async result')
      expect(mockAsyncFn).toHaveBeenCalled()
    })

    it('should pass through arguments correctly', () => {
      const mockFn = jest.fn((a: number, b: number) => a + b)
      const measured = measurePerformance(mockFn, 'add')

      const result = measured(5, 3)

      expect(result).toBe(8)
      expect(mockFn).toHaveBeenCalledWith(5, 3)
    })

    it('should preserve this context', () => {
      const obj = {
        value: 42,
        getValue: jest.fn(function(this: any) {
          return this.value
        }),
      }

      const measured = measurePerformance(obj.getValue, 'getValue')
      const result = measured.call(obj)

      expect(result).toBe(42)
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const mockFn = jest.fn()
      const debounced = debounce(mockFn, 300)

      debounced('first')
      debounced('second')
      debounced('third')

      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(300)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('third')
    })

    it('should handle multiple arguments', () => {
      const mockFn = jest.fn()
      const debounced = debounce(mockFn, 200)

      debounced(1, 'two', { three: 3 })

      jest.advanceTimersByTime(200)

      expect(mockFn).toHaveBeenCalledWith(1, 'two', { three: 3 })
    })

    it('should cancel previous timeouts', () => {
      const mockFn = jest.fn()
      const debounced = debounce(mockFn, 500)

      debounced('first')
      jest.advanceTimersByTime(300)
      debounced('second')
      jest.advanceTimersByTime(300)
      debounced('third')
      jest.advanceTimersByTime(500)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('third')
    })

    it('should work with zero delay', () => {
      const mockFn = jest.fn()
      const debounced = debounce(mockFn, 0)

      debounced('test')
      jest.advanceTimersByTime(0)

      expect(mockFn).toHaveBeenCalledWith('test')
    })
  })

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const mockFn = jest.fn()
      const throttled = throttle(mockFn, 1000)

      throttled('first')
      expect(mockFn).toHaveBeenCalledWith('first')

      throttled('second')
      throttled('third')
      expect(mockFn).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(1000)

      throttled('fourth')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('fourth')
    })

    it('should handle rapid calls', () => {
      const mockFn = jest.fn()
      const throttled = throttle(mockFn, 100)

      for (let i = 0; i < 10; i++) {
        throttled(i)
        jest.advanceTimersByTime(50)
      }

      expect(mockFn).toHaveBeenCalledTimes(5)
    })

    it('should preserve this context', () => {
      const obj = {
        count: 0,
        increment: jest.fn(function(this: any) {
          this.count++
          return this.count
        }),
      }

      const throttled = throttle(obj.increment, 100)
      
      const result1 = throttled.call(obj)
      expect(result1).toBe(1)

      jest.advanceTimersByTime(100)
      const result2 = throttled.call(obj)
      expect(result2).toBe(2)
    })
  })

  describe('memoize', () => {
    it('should cache function results', () => {
      const expensiveOperation = jest.fn((n: number) => {
        let result = 0
        for (let i = 0; i < n; i++) {
          result += i
        }
        return result
      })

      const memoized = memoize(expensiveOperation)

      expect(memoized(100)).toBe(4950)
      expect(memoized(100)).toBe(4950)
      expect(memoized(100)).toBe(4950)

      expect(expensiveOperation).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple arguments', () => {
      const mockFn = jest.fn((a: number, b: number) => a + b)
      const memoized = memoize(mockFn)

      expect(memoized(2, 3)).toBe(5)
      expect(memoized(2, 3)).toBe(5)
      expect(memoized(3, 2)).toBe(5)
      expect(memoized(2, 3)).toBe(5)

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle object arguments', () => {
      const mockFn = jest.fn((obj: { x: number }) => obj.x * 2)
      const memoized = memoize(mockFn)

      const obj1 = { x: 5 }
      const obj2 = { x: 5 }

      expect(memoized(obj1)).toBe(10)
      expect(memoized(obj1)).toBe(10)
      expect(memoized(obj2)).toBe(10)

      // Different object references are treated as different arguments
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle no arguments', () => {
      const mockFn = jest.fn(() => Math.random())
      const memoized = memoize(mockFn)

      const result1 = memoized()
      const result2 = memoized()

      expect(result1).toBe(result2)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('lazy', () => {
    it('should lazily initialize values', () => {
      const expensiveInit = jest.fn(() => {
        return { initialized: true, value: 42 }
      })

      const lazyValue = lazy(expensiveInit)

      expect(expensiveInit).not.toHaveBeenCalled()

      const result1 = lazyValue()
      expect(result1).toEqual({ initialized: true, value: 42 })
      expect(expensiveInit).toHaveBeenCalledTimes(1)

      const result2 = lazyValue()
      expect(result2).toBe(result1)
      expect(expensiveInit).toHaveBeenCalledTimes(1)
    })

    it('should handle different lazy instances', () => {
      let counter = 0
      const factory = () => ++counter

      const lazy1 = lazy(factory)
      const lazy2 = lazy(factory)

      expect(lazy1()).toBe(1)
      expect(lazy1()).toBe(1)
      expect(lazy2()).toBe(2)
      expect(lazy2()).toBe(2)
    })

    it('should handle errors in initialization', () => {
      const errorInit = jest.fn(() => {
        throw new Error('Initialization failed')
      })

      const lazyValue = lazy(errorInit)

      expect(() => lazyValue()).toThrow('Initialization failed')
      expect(errorInit).toHaveBeenCalledTimes(1)

      // Should try again on next call
      expect(() => lazyValue()).toThrow('Initialization failed')
      expect(errorInit).toHaveBeenCalledTimes(2)
    })

    it('should handle null and undefined values', () => {
      const lazyNull = lazy(() => null)
      const lazyUndefined = lazy(() => undefined)

      expect(lazyNull()).toBeNull()
      expect(lazyUndefined()).toBeUndefined()
    })
  })

  describe('Performance measurement in production', () => {
    it('should not log in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      // Use Object.defineProperty to temporarily override NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true
      })
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const mockFn = jest.fn(() => 'result')
      
      const measured = measurePerformance(mockFn, 'prodFunction')
      measured()

      expect(consoleSpy).not.toHaveBeenCalled()
      
      consoleSpy.mockRestore()
      // Restore original value
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      })
    })
  })
})