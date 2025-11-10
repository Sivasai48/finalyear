import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { farmerId, cropName, month } = body

    // Mock price data
    const basePrices: Record<string, number> = {
      Wheat: 2500,
      Rice: 3200,
      Cotton: 5500,
      Sugarcane: 3800,
      Maize: 1800,
    }

    const monthlyVariation = Math.random() * 0.2 - 0.1 // -10% to +10%
    const currentPrice = basePrices[cropName] || 2000
    const predictedPrice = Math.round(currentPrice * (1 + monthlyVariation))
    const priceChange = ((predictedPrice - currentPrice) / currentPrice) * 100

    const recommendation = priceChange > 5 ? "Hold and sell later" : priceChange < -5 ? "Sell now" : "Monitor market"

    // Save prediction to database
    const prediction = db.addPricePrediction({
      farmerId,
      cropName,
      month,
      currentPrice,
      predictedPrice,
      priceChange,
      recommendation,
      confidence: 75,
    })

    return NextResponse.json({
      success: true,
      data: {
        currentPrice,
        predictedPrice,
        priceChange: priceChange.toFixed(2),
        recommendation,
        confidence: 75,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to generate prediction" }, { status: 500 })
  }
}
