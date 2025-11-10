import { type NextRequest, NextResponse } from "next/server"
import { farmerCropsDatabase } from "@/database/add-crop"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cropId } = body

    const crop = farmerCropsDatabase.getById(cropId)

    if (!crop) {
      return NextResponse.json({ success: false, message: "Crop not found" }, { status: 404 })
    }

    farmerCropsDatabase.delete(cropId)

    return NextResponse.json({
      success: true,
      message: "Request declined and removed",
    })
  } catch (error) {
    console.error("[v0] Error declining request:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
