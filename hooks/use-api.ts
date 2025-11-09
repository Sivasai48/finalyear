"use client"

import { useState, useCallback } from "react"

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useApi(url: string, options: UseApiOptions = {}) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (method = "GET", body?: any) => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`)
        }

        const result = await response.json()
        setData(result)
        options.onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        setError(error)
        options.onError?.(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [url, options],
  )

  return { data, loading, error, execute }
}
