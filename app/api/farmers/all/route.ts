import { NextResponse } from "next/server"
import { farmerDatabase } from "@/database/farmer-profile"

export async function GET() {
  try {
    const farmers = farmerDatabase.getAll()

    return NextResponse.json({
      success: true,
      data: farmers,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch farmers" }, { status: 500 })
  }
}
