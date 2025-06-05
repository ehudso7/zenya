import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Custom hook for safe async operations with automatic cleanup
 * Prevents memory leaks by cancelling requests on unmount
 */
export function useAsync<T = any>() {
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      abortControllerRef.current?.abort()
    }
  }, [])

  const execute = useCallback(async (
    asyncFunction: (signal: AbortSignal) => Promise<T>
  ): Promise<T | undefined> => {
    // Cancel any pending request
    abortControllerRef.current?.abort()
    
    // Create new AbortController
    abortControllerRef.current = new AbortController()
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await asyncFunction(abortControllerRef.current.signal)
      
      if (isMountedRef.current) {
        setLoading(false)
        return result
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was cancelled, ignore
        return undefined
      }
      
      if (isMountedRef.current) {
        setError(err)
        setLoading(false)
        throw err
      }
    }
    
    return undefined
  }, [])

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  return { execute, cancel, loading, error }
}

/**
 * Hook for safe fetch operations with automatic cleanup
 */
export function useFetch<T = any>(url: string, options?: RequestInit) {
  const { execute, cancel, loading, error } = useAsync<T>()
  const [data, setData] = useState<T | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const result = await execute(async (signal) => {
        const response = await fetch(url, {
          ...options,
          signal,
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        return data
      })
      
      if (result !== undefined) {
        setData(result)
      }
    } catch (err) {
      // Error is already handled by useAsync
    }
  }, [url, options, execute])

  useEffect(() => {
    fetchData()
    
    return () => {
      cancel()
    }
  }, [fetchData, cancel])

  return { data, loading, error, refetch: fetchData }
}

/**
 * Hook for safe state updates that prevents updates after unmount
 */
export function useSafeState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const setSafeState = useCallback((value: T | ((prev: T) => T)) => {
    if (isMountedRef.current) {
      setState(value)
    }
  }, [])

  return [state, setSafeState] as const
}