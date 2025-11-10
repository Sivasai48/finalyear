import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

let cropListings: any[] = []

export function getCropListings() {
  return cropListings
}

export function setCropListings(listings: any[]) {
  cropListings = listings
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cropName, quantity, pricePerKg, location, description, phone, farmerId, farmerEmail, farmerName } = body

    const newCrop = db.addCrop({
      farmerId: farmerId || `farmer-${Date.now()}`,
      farmerName: farmerName || farmerEmail,
      farmerEmail,
      farmerPhone: phone,
      cropName,
      quantity: Number.parseInt(quantity),
      pricePerKg: Number.parseFloat(pricePerKg),
      location,
      description,
      status: "available",
    })

    return NextResponse.json({
      success: true,
      message: "Crop listing added successfully",
      data: newCrop,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to add crop listing" }, { status: 500 })
  }
}

export async function GET() {
  const crops = db.getAvailableCrops()

  return NextResponse.json({
    success: true,
    data: crops,
    count: crops.length,
  })
}
