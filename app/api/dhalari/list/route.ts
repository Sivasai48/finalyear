import { type NextRequest, NextResponse } from "next/server"

// Mock dhalari database
const dhalariList: any[] = []

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
      results = results.filter((d) => d.specialization?.some((c: string) => c.toLowerCase().includes(crop)))
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
