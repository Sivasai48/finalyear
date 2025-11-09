import { type NextRequest, NextResponse } from "next/server"

// Mock database for farmers
const farmers: Record<string, any> = {
  "919876543210": {
    id: "farmer1",
    phone: "919876543210",
    name: "Rajesh Kumar",
    state: "Punjab",
    crop: "Wheat",
    landSize: 5,
    verified: true,
    createdAt: new Date("2023-01-15"),
  },
}

// Mock OTP storage (in production, use Redis or database)
const otpStore: Record<string, { otp: string; expiresAt: number }> = {}

export async function POST(request: NextRequest) {
  try {
    const { action, phone, otp } = await request.json()

    if (action === "send-otp") {
      if (!phone) {
        return NextResponse.json({ error: "Phone number required" }, { status: 400 })
      }

      // Generate 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

      // In production, send via Twilio
      otpStore[phone] = { otp: generatedOtp, expiresAt }

      console.log(`OTP for ${phone}: ${generatedOtp}`) // For demo only

      return NextResponse.json({
        success: true,
        message: "OTP sent to phone number",
        otpForDemo: generatedOtp, // Remove in production
      })
    }

    if (action === "verify-otp") {
      if (!phone || !otp) {
        return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 })
      }

      const stored = otpStore[phone]
      if (!stored || stored.expiresAt < Date.now()) {
        return NextResponse.json({ error: "OTP expired or invalid" }, { status: 400 })
      }

      if (stored.otp !== otp) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 401 })
      }

      // Get or create farmer
      let farmer = farmers[phone]
      if (!farmer) {
        farmer = {
          id: `farmer-${Date.now()}`,
          phone,
          name: `Farmer ${phone.slice(-4)}`,
          state: "Not Set",
          crop: "Not Set",
          landSize: 0,
          verified: true,
          createdAt: new Date(),
        }
        farmers[phone] = farmer
      }

      // Clean up OTP
      delete otpStore[phone]

      return NextResponse.json({
        success: true,
        user: {
          id: farmer.id,
          phone: farmer.phone,
          name: farmer.name,
          type: "farmer",
        },
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Farmer login error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
