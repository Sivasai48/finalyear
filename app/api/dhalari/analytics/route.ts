import { type NextRequest, NextResponse } from "next/server"
import { dhalariAnalyticsDatabase } from "@/database/dhalari-analytics"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dhalariId = searchParams.get("dhalariId")

    if (!dhalariId) {
      return NextResponse.json({ success: false, message: "Dhalari ID required" }, { status: 400 })
    }

    const stats = dhalariAnalyticsDatabase.getStats(dhalariId)
    const monthlyData = dhalariAnalyticsDatabase.getMonthlyData(dhalariId)
    const cropDistribution = dhalariAnalyticsDatabase.getCropDistribution(dhalariId)

    return NextResponse.json({
      success: true,
      data: {
        stats,
        monthlyData,
        cropDistribution,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
