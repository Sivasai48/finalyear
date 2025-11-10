import { type NextRequest, NextResponse } from "next/server"
import { farmerCropsDatabase } from "@/database/add-crop"
import { dhalariAnalyticsDatabase } from "@/database/dhalari-analytics"
import { notificationsDatabase } from "@/database/notifications"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cropId, dhalariId, dhalariName } = body

    const crop = farmerCropsDatabase.getById(cropId)

    if (!crop) {
      return NextResponse.json({ success: false, message: "Crop not found" }, { status: 404 })
    }

    const totalValue = crop.quantity * crop.pricePerKg
    const commission = 0.05
    const earnings = totalValue * commission

    const currentDate = new Date()
    const month = currentDate.toLocaleDateString("en-US", { month: "short" })

    dhalariAnalyticsDatabase.addDeal({
      dhalariId: dhalariId || "dhalari-001",
      farmerId: crop.farmerId,
      cropType: crop.cropType,
      quantity: crop.quantity,
      pricePerKg: crop.pricePerKg,
      totalValue,
      commission,
      earnings,
      month,
      year: currentDate.getFullYear(),
      status: "completed",
    })

    farmerCropsDatabase.update(cropId, { status: "reserved" })

    notificationsDatabase.create({
      userId: crop.farmerId,
      userType: "farmer",
      type: "deal_accepted",
      title: "Deal Accepted!",
      message: `Your ${crop.cropName} crop (${crop.quantity} Kg) has been accepted by ${dhalariName || "a trader"}. Total value: ₹${totalValue.toLocaleString()}`,
      cropName: crop.cropName,
      dhalariName: dhalariName || "Trader",
      amount: totalValue,
      read: false,
    })

    return NextResponse.json({
      success: true,
      message: "Deal accepted successfully",
      data: { crop, earnings, totalValue },
    })
  } catch (error) {
    console.error("[v0] Error accepting deal:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
