import { type NextRequest, NextResponse } from "next/server"

interface PredictionRequest {
  crop: string
  soilType: string
  landSize: number
  irrigationType: string
  region: string
}

// Mock crop database
const cropDatabase: Record<string, any> = {
  wheat: {
    season: "Rabi",
    avgYield: 45,
    waterNeeded: 450,
    duration: 120,
    bestSoil: ["Clay", "Loam"],
    risks: ["Rust", "Powdery Mildew"],
    practices: ["Crop rotation", "Proper drainage", "Timely irrigation"],
  },
  rice: {
    season: "Kharif",
    avgYield: 55,
    waterNeeded: 1200,
    duration: 150,
    bestSoil: ["Clay", "Loamy Clay"],
    risks: ["Blast", "Bacterial Leaf Streak"],
    practices: ["Proper puddling", "Water management", "Pest control"],
  },
  cotton: {
    season: "Kharif",
    avgYield: 22,
    waterNeeded: 600,
    duration: 160,
    bestSoil: ["Well-drained Clay", "Loam"],
    risks: ["Bollworm", "Pink Bollworm"],
    practices: ["Regular monitoring", "Integrated pest management", "Timely picking"],
  },
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json()
    const { crop, soilType, landSize, irrigationType, region } = body

    const cropInfo = cropDatabase[crop.toLowerCase()]
    if (!cropInfo) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 })
    }

    // Calculate predicted yield based on parameters
    let yieldMultiplier = 1

    if (cropInfo.bestSoil.includes(soilType)) yieldMultiplier += 0.1
    if (irrigationType === "Drip") yieldMultiplier += 0.15
    else if (irrigationType === "Sprinkler") yieldMultiplier += 0.1

    const predictedYield = (cropInfo.avgYield * landSize * yieldMultiplier).toFixed(2)
    const successProbability = Math.min(95, 70 + yieldMultiplier * 10)

    return NextResponse.json({
      success: true,
      prediction: {
        crop,
        region,
        predictedYield,
        unit: "quintals",
        successProbability: successProbability.toFixed(1),
        duration: `${cropInfo.duration} days`,
        waterRequired: `${((cropInfo.waterNeeded * landSize) / 1000).toFixed(2)} mm`,
        bestSoil: cropInfo.bestSoil,
        risks: cropInfo.risks,
        practices: cropInfo.practices,
        season: cropInfo.season,
      },
    })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
