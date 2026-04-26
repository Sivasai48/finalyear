import { type NextRequest, NextResponse } from "next/server"

// Mock database for dhalaris
const dhalaris: Record<string, any> = {}

export async function POST(request: NextRequest) {
  try {
    const { action, email, code } = await request.json()

    if (action === "verify-oauth") {
      if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 })
      }

      // Mock OAuth verification
      let dhalari = dhalaris[email]
      if (!dhalari) {
        dhalari = {
          id: `dhalari-${Date.now()}`,
          email,
          name: email.split("@")[0],
          businessType: "Trader",
          specialization: [],
          location: "Not Set",
          rating: 4.0,
          verified: false,
          commission: 7,
          createdAt: new Date(),
        }
        dhalaris[email] = dhalari
      }

      return NextResponse.json({
        success: true,
        user: {
          id: dhalari.id,
          email: dhalari.email,
          name: dhalari.name,
          type: "dhalari",
        },
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Dhalari login error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
