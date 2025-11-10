import { NextResponse } from "next/server"
import { farmerDatabase } from "@/database/farmer-profile"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const farmerId = searchParams.get("farmerId")

    if (!farmerId) {
      return NextResponse.json({ success: false, error: "Farmer ID required" }, { status: 400 })
    }

    const farmer = farmerDatabase.getById(farmerId)

    if (!farmer) {
      return NextResponse.json({ success: false, error: "Farmer not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: farmer,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 })
  }
}
