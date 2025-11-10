import { NextResponse } from "next/server"
import { farmerDatabase } from "@/database/farmer-profile"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, phone, name, village, district, state, landSize, primaryCrops } = body

    const newFarmer = farmerDatabase.add({
      name,
      phone,
      village,
      district,
      state,
      landSize,
      primaryCrops: primaryCrops || [],
      verified: false,
    })

    return NextResponse.json({
      success: true,
      data: newFarmer,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create profile" }, { status: 500 })
  }
}
