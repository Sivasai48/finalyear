import { type NextRequest, NextResponse } from "next/server"
import { dhalariAnalyticsDatabase } from "@/database/dhalari-analytics"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dhalariId = searchParams.get("dhalariId")

    if (!dhalariId) {
      return NextResponse.json({ success: false, message: "Dhalari ID required" }, { status: 400 })
    }

    const deals = dhalariAnalyticsDatabase.getByDhalariId(dhalariId)

    return NextResponse.json({
      success: true,
      data: deals,
    })
  } catch (error) {
    console.error("[v0] Error fetching deals:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
