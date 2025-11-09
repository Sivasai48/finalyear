import { type NextRequest, NextResponse } from "next/server"

// Mock requests database
const requests: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { farmerId, crop, quantity, expectedPrice, description, preferredLocation, urgency } = body

    if (!farmerId || !crop || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newRequest = {
      id: `req-${Date.now()}`,
      farmerId,
      crop,
      quantity,
      expectedPrice,
      description,
      preferredLocation,
      urgency,
      status: "active",
      createdAt: new Date(),
      responses: 0,
    }

    requests.push(newRequest)

    return NextResponse.json({
      success: true,
      request: newRequest,
    })
  } catch (error) {
    console.error("Request creation error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
