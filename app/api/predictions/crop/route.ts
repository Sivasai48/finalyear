import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { farmerId, cropName, soilType, landSize, irrigationType, region } = body

    // Calculate prediction (mock algorithm)
    const baseYield =
      {
        Wheat: 3000,
        Rice: 2500,
        Cotton: 1500,
        Sugarcane: 70000,
        Maize: 2800,
      }[cropName] || 2000

    const soilMultiplier =
      {
        Loamy: 1.2,
        Clay: 1.0,
        Sandy: 0.8,
        Silt: 1.1,
        Black: 1.15,
      }[soilType] || 1.0

    const irrigationMultiplier =
      {
        Drip: 1.3,
        Sprinkler: 1.2,
        Flood: 1.0,
        Rainfed: 0.7,
      }[irrigationType] || 1.0

    const predictedYield = Math.round(baseYield * soilMultiplier * irrigationMultiplier * landSize)
    const successProbability = Math.min(95, Math.round(65 + soilMultiplier * 15 + irrigationMultiplier * 10))

    const bestPractices = [
      `Use ${irrigationType} irrigation for optimal water management`,
      `Apply organic fertilizers for ${soilType} soil`,
      `Monitor weather forecasts regularly`,
      `Implement crop rotation practices`,
    ]

    // Save prediction to database
    const prediction = db.addCropPrediction({
      farmerId,
      cropName,
      soilType,
      landSize,
      irrigationType,
      region,
      predictedYield,
      successProbability,
      bestPractices,
    })

    return NextResponse.json({
      success: true,
      data: {
        predictedYield,
        successProbability,
        bestPractices,
        estimatedTimeline: "120-150 days",
        riskFactors: ["Weather dependency", "Market price fluctuation"],
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to generate prediction" }, { status: 500 })
  }
}
