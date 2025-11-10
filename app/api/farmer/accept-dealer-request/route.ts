import { NextResponse } from "next/server"
import { dhalariRequestsDatabase } from "@/database/dhalari-requests"
import { notificationsDatabase } from "@/database/notifications"

export async function POST(request: Request) {
  try {
    const { requestId, farmerId } = await request.json()

    const updatedRequest = dhalariRequestsDatabase.updateStatus(requestId, "accepted")

    if (updatedRequest) {
      // Notify the dhalari
      notificationsDatabase.create({
        userId: updatedRequest.dhalariId,
        userType: "dhalari",
        title: "Request Accepted!",
        message: `A farmer has accepted your request for ${updatedRequest.quantityRequired}kg of ${updatedRequest.cropRequired}`,
        type: "success",
        relatedId: requestId,
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to accept request" }, { status: 500 })
  }
}
