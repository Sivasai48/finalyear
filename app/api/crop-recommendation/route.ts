import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Call the external ML recommendation service on port 5000
    // Based on the user's input of http://127.0.0.1:5000
    // Updated to use the JSON API endpoint /api/predict correctly
    const response = await fetch("http://127.0.0.1:5000/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: errorData.detail || "Recommendation failed" },
        { status: response.status }
      )
    }

    const data = await response.json()
    // The ML service is expected to return something like { "recommended_crop": "...", "message": "..." }
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    console.error("[v0] Recommendation service error:", error)
    return NextResponse.json(
      { success: false, error: "Recommendation service unavailable. Make sure it is running on port 5000." },
      { status: 503 }
    )
  }
}
