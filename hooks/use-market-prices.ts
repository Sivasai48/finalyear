"use client"

import { useState, useEffect } from "react"

export function useMarketPrices(crop: string) {
  const [prices, setPrices] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!crop) return

    const fetchPrices = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/market/prices?crop=${crop}`)
        if (!response.ok) throw new Error("Failed to fetch prices")
        const data = await response.json()
        setPrices(data.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error fetching prices"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
  }, [crop])

  return { prices, loading, error }
}
