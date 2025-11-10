import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dhalariId = searchParams.get("dhalariId")

    if (!dhalariId) {
      return NextResponse.json({ success: false, message: "Dhalari ID required" }, { status: 400 })
    }

    // Get dynamic stats from database
    const stats = db.getDhalariStats(dhalariId)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch stats" }, { status: 500 })
  }
}
