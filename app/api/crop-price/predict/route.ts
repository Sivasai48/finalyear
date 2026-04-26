import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const response = await fetch("http://localhost:8001/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: errorData.detail || "Prediction failed" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Prediction service unavailable. Make sure it is running on port 8001." },
      { status: 503 }
    )
  }
}
