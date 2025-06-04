import {
  cn,
  generateId,
  formatDate,
  formatTime,
  calculateStreak,
  getGreeting,
  shuffleArray,
  debounce,
} from './utils'

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      expect(cn('btn', 'btn-primary')).toBe('btn btn-primary')
      expect(cn('p-4', 'p-2')).toBe('p-2') // Tailwind merge should override
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle conditional classes', () => {
      expect(cn('btn', true && 'btn-active', false && 'btn-disabled')).toBe('btn btn-active')
      expect(cn('btn', undefined, null, '')).toBe('btn')
    })

    it('should handle arrays and objects', () => {
      expect(cn(['btn', 'btn-primary'])).toBe('btn btn-primary')
      expect(cn({ btn: true, 'btn-primary': true, 'btn-disabled': false })).toBe('btn btn-primary')
    })

    it('should handle complex tailwind class merging', () => {
      expect(cn('px-2 py-1', 'px-3')).toBe('py-1 px-3')
      expect(cn('hover:bg-gray-100', 'hover:bg-blue-100')).toBe('hover:bg-blue-100')
      expect(cn('md:block', 'md:hidden')).toBe('md:hidden')
    })

    it('should handle empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
      expect(cn(null, undefined)).toBe('')
    })
  })

  describe('generateId', () => {
    it('should generate a unique string ID', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(typeof id1).toBe('string')
      expect(id1).toHaveLength(9)
      expect(id1).not.toBe(id2)
    })

    it('should generate IDs with alphanumeric characters', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z0-9]+$/)
    })

    it('should generate many unique IDs', () => {
      const ids = new Set()
      for (let i = 0; i < 1000; i++) {
        ids.add(generateId())
      }
      expect(ids.size).toBe(1000)
    })
  })

  describe('formatDate', () => {
    it('should format Date objects correctly', () => {
      const date = new Date('2024-03-15T12:00:00Z')
      expect(formatDate(date)).toMatch(/Mar 15, 2024/)
    })

    it('should format date strings correctly', () => {
      expect(formatDate('2024-01-01')).toMatch(/Jan 1, 2024/)
      expect(formatDate('2024-12-25T00:00:00Z')).toMatch(/Dec 25, 2024/)
    })

    it('should handle different date string formats', () => {
      expect(formatDate('2024-06-15T14:30:00.000Z')).toMatch(/Jun 15, 2024/)
      expect(formatDate('2024/07/04')).toMatch(/Jul 4, 2024/)
    })

    it('should handle invalid dates gracefully', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date')
      expect(formatDate('')).toBe('Invalid Date')
    })

    it('should use locale-appropriate formatting', () => {
      const date = new Date('2024-03-05')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/Mar 5, 2024/)
    })
  })

  describe('formatTime', () => {
    it('should format time correctly with AM/PM', () => {
      const morning = new Date('2024-01-01T09:30:00')
      expect(formatTime(morning)).toMatch(/9:30 AM/)

      const afternoon = new Date('2024-01-01T14:45:00')
      expect(formatTime(afternoon)).toMatch(/2:45 PM/)

      const midnight = new Date('2024-01-01T00:00:00')
      expect(formatTime(midnight)).toMatch(/12:00 AM/)

      const noon = new Date('2024-01-01T12:00:00')
      expect(formatTime(noon)).toMatch(/12:00 PM/)
    })

    it('should handle string dates', () => {
      expect(formatTime('2024-01-01T15:30:00')).toMatch(/3:30 PM/)
      expect(formatTime('2024-01-01T08:05:00')).toMatch(/8:05 AM/)
    })

    it('should format minutes with leading zeros', () => {
      const time = new Date('2024-01-01T14:05:00')
      expect(formatTime(time)).toMatch(/2:05 PM/)
    })

    it('should handle invalid times', () => {
      expect(formatTime('invalid')).toBe('Invalid Date')
    })
  })

  describe('calculateStreak', () => {
    beforeEach(() => {
      // Mock current date to ensure consistent tests
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-03-15T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return 0 for null lastLogin', () => {
      expect(calculateStreak(null)).toBe(0)
    })

    it('should return 1 for login within last 24 hours', () => {
      const now = new Date()
      const recentLogin = new Date(now.getTime() - 12 * 60 * 60 * 1000) // 12 hours ago
      expect(calculateStreak(recentLogin.toISOString())).toBe(1)
    })

    it('should return 1 for login exactly 24 hours ago', () => {
      const now = new Date()
      const yesterdayLogin = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
      expect(calculateStreak(yesterdayLogin.toISOString())).toBe(1)
    })

    it('should return 0 for login more than 24 hours ago', () => {
      const now = new Date()
      const oldLogin = new Date(now.getTime() - 36 * 60 * 60 * 1000) // 36 hours ago
      expect(calculateStreak(oldLogin.toISOString())).toBe(0)
    })

    it('should handle future dates gracefully', () => {
      const now = new Date()
      const futureLogin = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour in future
      expect(calculateStreak(futureLogin.toISOString())).toBe(1)
    })
  })

  describe('getGreeting', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return Good morning for morning hours', () => {
      const morningTimes = [0, 6, 9, 11]
      morningTimes.forEach(hour => {
        jest.setSystemTime(new Date(`2024-01-01T${hour.toString().padStart(2, '0')}:00:00`))
        expect(getGreeting()).toBe('Good morning')
      })
    })

    it('should return Good afternoon for afternoon hours', () => {
      const afternoonTimes = [12, 14, 16, 17]
      afternoonTimes.forEach(hour => {
        jest.setSystemTime(new Date(`2024-01-01T${hour.toString().padStart(2, '0')}:00:00`))
        expect(getGreeting()).toBe('Good afternoon')
      })
    })

    it('should return Good evening for evening hours', () => {
      const eveningTimes = [18, 20, 22, 23]
      eveningTimes.forEach(hour => {
        jest.setSystemTime(new Date(`2024-01-01T${hour.toString().padStart(2, '0')}:00:00`))
        expect(getGreeting()).toBe('Good evening')
      })
    })

    it('should handle edge cases correctly', () => {
      jest.setSystemTime(new Date('2024-01-01T11:59:59'))
      expect(getGreeting()).toBe('Good morning')

      jest.setSystemTime(new Date('2024-01-01T12:00:00'))
      expect(getGreeting()).toBe('Good afternoon')

      jest.setSystemTime(new Date('2024-01-01T17:59:59'))
      expect(getGreeting()).toBe('Good afternoon')

      jest.setSystemTime(new Date('2024-01-01T18:00:00'))
      expect(getGreeting()).toBe('Good evening')
    })
  })

  describe('shuffleArray', () => {
    it('should return a new array', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffleArray(original)

      expect(shuffled).not.toBe(original)
      expect(original).toEqual([1, 2, 3, 4, 5]) // Original unchanged
    })

    it('should contain all original elements', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffleArray(original)

      expect(shuffled).toHaveLength(original.length)
      expect(shuffled.sort()).toEqual(original.sort())
    })

    it('should handle empty arrays', () => {
      expect(shuffleArray([])).toEqual([])
    })

    it('should handle single element arrays', () => {
      expect(shuffleArray([1])).toEqual([1])
    })

    it('should handle arrays with duplicate values', () => {
      const original = [1, 1, 2, 2, 3, 3]
      const shuffled = shuffleArray(original)

      expect(shuffled.filter(x => x === 1)).toHaveLength(2)
      expect(shuffled.filter(x => x === 2)).toHaveLength(2)
      expect(shuffled.filter(x => x === 3)).toHaveLength(2)
    })

    it('should work with different data types', () => {
      const strings = ['a', 'b', 'c', 'd']
      const shuffledStrings = shuffleArray(strings)
      expect(shuffledStrings.sort()).toEqual(strings.sort())

      const objects = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const shuffledObjects = shuffleArray(objects)
      expect(shuffledObjects).toHaveLength(objects.length)
      objects.forEach(obj => {
        expect(shuffledObjects).toContainEqual(obj)
      })
    })

    it('should produce different orders (statistically)', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const results = new Set()

      // Run shuffle many times
      for (let i = 0; i < 100; i++) {
        results.add(shuffleArray(original).join(','))
      }

      // Should produce multiple different orderings
      expect(results.size).toBeGreaterThan(1)
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

    it('should handle zero delay', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 0)

      debouncedFn('test')
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(0)
      expect(mockFn).toHaveBeenCalledWith('test')
    })

    it('should handle functions with no arguments', () => {
      const mockFn = jest.fn(() => 'result')
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith()
    })

    it('should work with async functions', async () => {
      const mockAsyncFn = jest.fn(async (value: string) => {
        return `processed: ${value}`
      })
      const debouncedFn = debounce(mockAsyncFn, 100)

      debouncedFn('test')
      jest.advanceTimersByTime(100)

      expect(mockAsyncFn).toHaveBeenCalledWith('test')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle edge cases in cn', () => {
      expect(cn(0 as any)).toBe('0')
      expect(cn(false as any)).toBe('')
      expect(cn(true as any)).toBe('')
      expect(cn(NaN as any)).toBe('')
    })

    it('should handle Math.random edge cases in generateId', () => {
      const originalRandom = Math.random
      Math.random = jest.fn(() => 0)
      
      const id = generateId()
      expect(id).toHaveLength(9)
      
      Math.random = originalRandom
    })

    it('should handle Date constructor edge cases', () => {
      expect(formatDate(new Date('invalid'))).toBe('Invalid Date')
      expect(formatTime(new Date('invalid'))).toBe('Invalid Date')
    })
  })
})