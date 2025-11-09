"use client"

import { useState } from "react"

interface CropFormData {
  crop: string
  soilType: string
  landSize: number
  irrigationType: string
  region: string
}

export function useCropPrediction() {
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const predict = async (data: CropFormData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/crops/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Prediction failed")
      const result = await response.json()
      setPrediction(result.prediction)
      return result.prediction
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching prediction"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { prediction, loading, error, predict }
}
