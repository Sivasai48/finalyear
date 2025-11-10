export interface CropPrediction {
  id: string
  farmerId: string
  cropType: string
  soilType: string
  landSize: number
  irrigationType: string
  region: string
  season: string
  predictedYield: number
  successRate: number
  bestPractices: string[]
  risks: string[]
  estimatedRevenue: number
  createdAt: string
}

const cropPredictionsDB: CropPrediction[] = []

export const cropPredictionDatabase = {
  getAll: () => cropPredictionsDB,

  getByFarmerId: (farmerId: string) => cropPredictionsDB.filter((pred) => pred.farmerId === farmerId),

  add: (prediction: Omit<CropPrediction, "id" | "createdAt">) => {
    const newPrediction: CropPrediction = {
      ...prediction,
      id: `pred-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    cropPredictionsDB.push(newPrediction)
    return newPrediction
  },

  getStats: () => ({
    totalPredictions: cropPredictionsDB.length,
    averageSuccessRate: cropPredictionsDB.reduce((sum, p) => sum + p.successRate, 0) / cropPredictionsDB.length || 0,
    topCrop: cropPredictionsDB.reduce(
      (acc, p) => {
        acc[p.cropType] = (acc[p.cropType] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  }),
}
