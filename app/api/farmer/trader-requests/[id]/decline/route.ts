import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // In production, update the request status in database
    // For now, return success response
    return NextResponse.json({
      success: true,
      message: "Request declined successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to decline request" }, { status: 500 })
  }
}
