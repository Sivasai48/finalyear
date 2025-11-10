import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const farmerId = searchParams.get("farmerId")

    if (!farmerId) {
      return NextResponse.json({ success: false, message: "Farmer ID required" }, { status: 400 })
    }

    const crops = db.getCropsByFarmer(farmerId)

    return NextResponse.json({
      success: true,
      data: crops,
      count: crops.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch crops" }, { status: 500 })
  }
}
