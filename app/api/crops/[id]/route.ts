import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

// In-memory storage (shared with add route)
let cropListings: any[] = []

export function setCropListings(listings: any[]) {
  cropListings = listings
}

export function getCropListings() {
  return cropListings
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { cropName, quantity, pricePerKg, location, description } = body
    const cropId = params.id

    const updatedCrop = await db.updateCrop(cropId, {
      cropName,
      quantity: Number.parseInt(quantity),
      pricePerKg: Number.parseFloat(pricePerKg),
      location,
      description,
    })

    if (!updatedCrop) {
      return NextResponse.json({ success: false, message: "Crop not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Crop updated successfully",
      data: updatedCrop,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update crop" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cropId = params.id

    const deleted = await db.deleteCrop(cropId)

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Crop not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Crop deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to delete crop" }, { status: 500 })
  }
}
