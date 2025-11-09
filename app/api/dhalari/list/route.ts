import { type NextRequest, NextResponse } from "next/server"

// Mock dhalari database
const dhalariList = [
  {
    id: "1",
    name: "Sharma Trading Co.",
    phone: "+91 98765 43210",
    email: "sharma@trading.com",
    specialization: ["Wheat", "Rice"],
    location: "Amritsar, Punjab",
    rating: 4.8,
    deals: 1250,
    commission: 5,
    experience: 15,
    verified: true,
  },
  {
    id: "2",
    name: "Patel Grains Export",
    phone: "+91 87654 32109",
    email: "patel@grainsexport.com",
    specialization: ["Cotton", "Sugarcane"],
    location: "Ahmednagar, Maharashtra",
    rating: 4.6,
    deals: 890,
    commission: 6,
    experience: 12,
    verified: true,
  },
  {
    id: "3",
    name: "Gupta & Sons Wholesale",
    phone: "+91 76543 21098",
    email: "gupta@wholesale.com",
    specialization: ["Wheat", "Barley", "Maize"],
    location: "Delhi",
    rating: 4.7,
    deals: 2100,
    commission: 4,
    experience: 20,
    verified: true,
  },
  {
    id: "4",
    name: "Singh Cooperative",
    phone: "+91 65432 10987",
    email: "singh@cooperative.com",
    specialization: ["Rice", "Pulses"],
    location: "Burdwan, West Bengal",
    rating: 4.5,
    deals: 650,
    commission: 7,
    experience: 8,
    verified: false,
  },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")?.toLowerCase() || ""
    const crop = searchParams.get("crop")?.toLowerCase() || ""
    const minRating = Number.parseFloat(searchParams.get("minRating") || "0")

    let results = dhalariList

    // Filter by search term
    if (search) {
      results = results.filter(
        (d) => d.name.toLowerCase().includes(search) || d.location.toLowerCase().includes(search),
      )
    }

    // Filter by crop specialization
    if (crop) {
      results = results.filter((d) => d.specialization.some((c) => c.toLowerCase().includes(crop)))
    }

    // Filter by minimum rating
    results = results.filter((d) => d.rating >= minRating)

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    })
  } catch (error) {
    console.error("Dhalari list error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
