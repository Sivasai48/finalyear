import { NextResponse } from "next/server"

export async function GET() {
  // Mock data - in production, fetch from database based on authenticated farmer
  const traderRequests: any[] = []

  return NextResponse.json({
    success: true,
    data: traderRequests,
  })
}
