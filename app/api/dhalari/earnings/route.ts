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

    const monthlyMap = new Map<string, { earnings: number; deals: number; month: string; year: number }>()

    deals.forEach((deal) => {
      const key = `${deal.month}-${deal.year}`
      const existing = monthlyMap.get(key) || { earnings: 0, deals: 0, month: deal.month, year: deal.year }
      monthlyMap.set(key, {
        ...existing,
        earnings: existing.earnings + deal.earnings,
        deals: existing.deals + 1,
      })
    })

    const monthly = Array.from(monthlyMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return months.indexOf(b.month) - months.indexOf(a.month)
    })

    const total = deals.reduce((sum, deal) => sum + deal.earnings, 0)

    return NextResponse.json({
      success: true,
      data: { monthly, total },
    })
  } catch (error) {
    console.error("[v0] Error fetching earnings:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
