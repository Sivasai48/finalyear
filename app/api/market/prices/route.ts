import { type NextRequest, NextResponse } from "next/server"

// Mock market price database
const marketPrices: Record<string, any> = {
  wheat: {
    current: 2400,
    week: 2380,
    month: 2350,
    trend: "up",
    apmc: [
      { location: "Amritsar, Punjab", price: 2450 },
      { location: "Ludhiana, Punjab", price: 2420 },
      { location: "Indore, Madhya Pradesh", price: 2350 },
      { location: "Jaipur, Rajasthan", price: 2380 },
    ],
  },
  rice: {
    current: 3200,
    week: 3150,
    month: 3100,
    trend: "stable",
    apmc: [
      { location: "Chhattisgarh", price: 3250 },
      { location: "West Bengal", price: 3180 },
      { location: "Punjab", price: 3220 },
      { location: "Odisha", price: 3150 },
    ],
  },
  cotton: {
    current: 5800,
    week: 5750,
    month: 5650,
    trend: "down",
    apmc: [
      { location: "Ahmednagar, Maharashtra", price: 5900 },
      { location: "Jalna, Maharashtra", price: 5850 },
      { location: "Telangana", price: 5750 },
      { location: "Madhya Pradesh", price: 5700 },
    ],
  },
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const crop = searchParams.get("crop")

    if (!crop) {
      return NextResponse.json({ error: "Crop parameter required" }, { status: 400 })
    }

    const prices = marketPrices[crop.toLowerCase()]
    if (!prices) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 })
    }

    // Generate 6-month historical data
    const historicalData = Array.from({ length: 24 }, (_, i) => {
      const days = i * 7
      const variation = Math.sin(i / 4) * 200 + (Math.random() * 100 - 50)
      return {
        week: `Week ${i + 1}`,
        price: Math.max(prices.current - 500, prices.current + variation),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        crop,
        current: prices.current,
        weekChange: prices.current - prices.week,
        monthChange: prices.current - prices.month,
        trend: prices.trend,
        apmcData: prices.apmc,
        historicalData,
        recommendation: prices.trend === "up" ? "Good time to sell soon" : "Consider waiting for better prices",
      },
    })
  } catch (error) {
    console.error("Market price error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
