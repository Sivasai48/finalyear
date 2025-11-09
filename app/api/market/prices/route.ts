import { type NextRequest, NextResponse } from "next/server"

const marketPrices: Record<string, any> = {
  wheat: {
    current: 2400,
    apmc: [
      { location: "Amritsar, Punjab", price: 2450 },
      { location: "Ludhiana, Punjab", price: 2420 },
      { location: "Indore, Madhya Pradesh", price: 2350 },
      { location: "Jaipur, Rajasthan", price: 2380 },
    ],
    monthlyData: {
      January: { price: 2320, predicted: 2350 },
      February: { price: 2340, predicted: 2380 },
      March: { price: 2360, predicted: 2400 },
      April: { price: 2380, predicted: 2420 },
      May: { price: 2400, predicted: 2450 },
      June: { price: 2420, predicted: 2480 },
      July: { price: 2380, predicted: 2420 },
      August: { price: 2350, predicted: 2380 },
      September: { price: 2330, predicted: 2360 },
      October: { price: 2310, predicted: 2340 },
      November: { price: 2290, predicted: 2320 },
      December: { price: 2300, predicted: 2330 },
    },
    bestMonth: "June",
  },
  rice: {
    current: 3200,
    apmc: [
      { location: "Chhattisgarh", price: 3250 },
      { location: "West Bengal", price: 3180 },
      { location: "Punjab", price: 3220 },
      { location: "Odisha", price: 3150 },
    ],
    monthlyData: {
      January: { price: 3100, predicted: 3150 },
      February: { price: 3120, predicted: 3170 },
      March: { price: 3150, predicted: 3200 },
      April: { price: 3180, predicted: 3230 },
      May: { price: 3200, predicted: 3250 },
      June: { price: 3220, predicted: 3280 },
      July: { price: 3240, predicted: 3300 },
      August: { price: 3200, predicted: 3260 },
      September: { price: 3150, predicted: 3200 },
      October: { price: 3120, predicted: 3170 },
      November: { price: 3100, predicted: 3150 },
      December: { price: 3110, predicted: 3160 },
    },
    bestMonth: "July",
  },
  cotton: {
    current: 5800,
    apmc: [
      { location: "Ahmednagar, Maharashtra", price: 5900 },
      { location: "Jalna, Maharashtra", price: 5850 },
      { location: "Telangana", price: 5750 },
      { location: "Madhya Pradesh", price: 5700 },
    ],
    monthlyData: {
      January: { price: 5600, predicted: 5650 },
      February: { price: 5620, predicted: 5670 },
      March: { price: 5650, predicted: 5700 },
      April: { price: 5700, predicted: 5750 },
      May: { price: 5750, predicted: 5800 },
      June: { price: 5800, predicted: 5850 },
      July: { price: 5850, predicted: 5900 },
      August: { price: 5820, predicted: 5870 },
      September: { price: 5780, predicted: 5830 },
      October: { price: 5720, predicted: 5770 },
      November: { price: 5680, predicted: 5730 },
      December: { price: 5650, predicted: 5700 },
    },
    bestMonth: "August",
  },
  sugarcane: {
    current: 3500,
    apmc: [
      { location: "Uttar Pradesh", price: 3550 },
      { location: "Maharashtra", price: 3480 },
      { location: "Karnataka", price: 3420 },
    ],
    monthlyData: {
      January: { price: 3400, predicted: 3450 },
      February: { price: 3420, predicted: 3470 },
      March: { price: 3450, predicted: 3500 },
      April: { price: 3480, predicted: 3530 },
      May: { price: 3500, predicted: 3550 },
      June: { price: 3520, predicted: 3570 },
      July: { price: 3540, predicted: 3590 },
      August: { price: 3500, predicted: 3550 },
      September: { price: 3450, predicted: 3500 },
      October: { price: 3400, predicted: 3450 },
      November: { price: 3380, predicted: 3430 },
      December: { price: 3390, predicted: 3440 },
    },
    bestMonth: "July",
  },
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const crop = searchParams.get("crop")
    const month = searchParams.get("month")

    if (!crop) {
      return NextResponse.json({ error: "Crop parameter required" }, { status: 400 })
    }

    const prices = marketPrices[crop.toLowerCase()]
    if (!prices) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 })
    }

    const selectedMonth = month || new Date().toLocaleString("en-US", { month: "long" })
    const monthData = prices.monthlyData[selectedMonth as keyof typeof prices.monthlyData]

    const chartData = Object.entries(prices.monthlyData).map(([monthName, data]: [string, any]) => ({
      month: monthName.substring(0, 3),
      price: data.price,
      predicted: data.predicted,
    }))

    const avgPrice = Math.round(
      prices.apmc.reduce((sum: number, item: any) => sum + item.price, 0) / prices.apmc.length,
    )

    return NextResponse.json({
      success: true,
      data: {
        crop,
        currentPrice: prices.current,
        selectedMonth,
        monthPrice: monthData?.price || prices.current,
        predictedPrice: monthData?.predicted || prices.current,
        priceChange: monthData ? Math.round(((monthData.predicted - monthData.price) / monthData.price) * 100) : 0,
        apmcPrice: avgPrice,
        bestMonth: prices.bestMonth,
        chartData,
        apmcData: prices.apmc,
        recommendation:
          monthData && monthData.predicted > monthData.price
            ? `Prices likely to increase in ${selectedMonth}. Good time to hold and sell later.`
            : `Prices may decrease in ${selectedMonth}. Consider selling now if possible.`,
        tips: [
          `Current market price: ₹${prices.current}/quintal`,
          `${selectedMonth} prediction: ₹${monthData?.predicted || prices.current}/quintal`,
          `Best month to sell: ${prices.bestMonth}`,
          `Average APMC price: ₹${avgPrice}/quintal`,
        ],
      },
    })
  } catch (error) {
    console.error("Market price error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
