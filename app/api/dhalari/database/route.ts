import { NextResponse } from "next/server"
import { dhalariDatabase } from "@/database/dhalaris"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: dhalariDatabase,
      count: dhalariDatabase.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch dhalaris" }, { status: 500 })
  }
}
