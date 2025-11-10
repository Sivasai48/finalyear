export interface PricePrediction {
  id: string
  farmerId: string
  cropType: string
  currentPrice: number
  predictedPrice: number
  month: string
  marketTrend: "up" | "down" | "stable"
  recommendation: string
  confidence: number
  createdAt: string
}

const pricePredictionsDB: PricePrediction[] = []

export const pricePredictionDatabase = {
  getAll: () => pricePredictionsDB,

  getByCrop: (cropType: string) =>
    pricePredictionsDB.filter((pred) => pred.cropType.toLowerCase() === cropType.toLowerCase()),

  getByFarmerId: (farmerId: string) => pricePredictionsDB.filter((pred) => pred.farmerId === farmerId),

  add: (prediction: Omit<PricePrediction, "id" | "createdAt">) => {
    const newPrediction: PricePrediction = {
      ...prediction,
      id: `price-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    pricePredictionsDB.push(newPrediction)
    return newPrediction
  },

  getAveragePrice: (cropType: string) => {
    const predictions = pricePredictionsDB.filter((p) => p.cropType === cropType)
    return predictions.reduce((sum, p) => sum + p.currentPrice, 0) / predictions.length || 0
  },
}
