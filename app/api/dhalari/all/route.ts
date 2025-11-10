import { NextResponse } from "next/server"
import { dhalariDatabase } from "@/database/dhalari-info"

export async function GET() {
  try {
    const dhalaris = dhalariDatabase.getAll()

    return NextResponse.json({
      success: true,
      data: dhalaris,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch traders" }, { status: 500 })
  }
}
