"use client"

import { useState, useCallback } from "react"

interface FilterOptions {
  search?: string
  crop?: string
  minRating?: number
}

export function useDhalariList() {
  const [dhalaris, setDhalaris] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDhalaris = useCallback(async (filters?: FilterOptions) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append("search", filters.search)
      if (filters?.crop) params.append("crop", filters.crop)
      if (filters?.minRating) params.append("minRating", filters.minRating.toString())

      const response = await fetch(`/api/dhalari/list?${params}`)
      if (!response.ok) throw new Error("Failed to fetch dhalaris")
      const data = await response.json()
      setDhalaris(data.data)
      return data.data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching dhalaris"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { dhalaris, loading, error, fetchDhalaris }
}
