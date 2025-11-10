import { NextResponse } from "next/server"
import { dhalariRequestsDatabase } from "@/database/dhalari-requests"

export async function GET() {
  try {
    const requests = dhalariRequestsDatabase.getByStatus("pending")

    return NextResponse.json({
      success: true,
      data: requests,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch requests" }, { status: 500 })
  }
}
