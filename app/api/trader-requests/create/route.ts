import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      dhalariId,
      dhalariName,
      dhalariPhone,
      cropId,
      farmerId,
      cropName,
      requestedQuantity,
      offeredPrice,
      message,
    } = body

    // Create trader request in database
    const traderRequest = db.addTraderRequest({
      dhalariId,
      dhalariName,
      dhalariPhone,
      cropId,
      farmerId,
      cropName,
      requestedQuantity: Number.parseInt(requestedQuantity),
      offeredPrice: Number.parseFloat(offeredPrice),
      message,
      status: "pending",
    })

    return NextResponse.json({
      success: true,
      message: "Request sent successfully",
      data: traderRequest,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to create request" }, { status: 500 })
  }
}
