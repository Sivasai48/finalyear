import { NextResponse } from "next/server"
import { dhalariRequestsDatabase } from "@/database/dhalari-requests"
import { notificationsDatabase } from "@/database/notifications"
import { farmerDatabase } from "@/database/farmer-profile"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newRequest = dhalariRequestsDatabase.add({
      ...body,
      status: "pending",
    })

    // Send notifications to all farmers
    const farmers = farmerDatabase.getAll()
    farmers.forEach((farmer) => {
      notificationsDatabase.create({
        userId: farmer.id,
        userType: "farmer",
        title: "New Crop Request",
        message: `${body.dhalariName} is looking for ${body.quantityRequired}kg of ${body.cropRequired} at ₹${body.priceOffered}/kg`,
        type: "request",
        relatedId: newRequest.id,
      })
    })

    return NextResponse.json({
      success: true,
      data: newRequest,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to send request" }, { status: 500 })
  }
}
