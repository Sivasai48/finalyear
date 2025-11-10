import { NextResponse } from "next/server"
import { farmerDatabase } from "@/database/farmer-profile"

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { farmerId, ...updates } = body

    const updatedFarmer = farmerDatabase.update(farmerId, updates)

    if (!updatedFarmer) {
      return NextResponse.json({ success: false, error: "Farmer not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedFarmer,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 })
  }
}
