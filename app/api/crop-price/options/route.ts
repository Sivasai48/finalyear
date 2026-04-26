import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("http://localhost:8001/options", {
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch options from prediction service" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Prediction service unavailable. Make sure it is running on port 8001." },
      { status: 503 }
    )
  }
}
