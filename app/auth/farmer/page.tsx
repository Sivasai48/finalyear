"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { Sprout, ArrowLeft } from "lucide-react"

export default function FarmerAuth() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [demoOtp, setDemoOtp] = useState("")
  const router = useRouter()
  const { login } = useAuthContext()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/farmer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp", phone: phone }),
      })

      const data = await response.json()

      if (data.success) {
        setDemoOtp(data.otpForDemo)
        setStep("otp")
        setError("")
      } else {
        console.error("OTP Send Error:", data)
        setError(data.detail || "Failed to send OTP")
      }
    } catch (err) {
      console.error("Fetch Error:", err)
      setError("Failed to send OTP. Is the server running?")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setLoading(true)
    try {
      // Call Python Backend
      const response = await fetch("http://127.0.0.1:8000/api/auth/farmer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send raw phone (10 digits expected by backend logic we wrote, or whatever input has)
        body: JSON.stringify({ action: "verify-otp", phone: phone, otp }),
      })

      const data = await response.json()

      if (data.success) {
        // Save Token
        localStorage.setItem("auth-token", data.access_token)
        login(data.user)
        router.push("/farmer/dashboard")
      } else {
        console.error("OTP Verify Error:", data)
        setError(data.detail || "Invalid OTP")
      }
    } catch (err: any) {
      console.error("Verify Fetch Error:", err)
      setError(`Failed to verify OTP: ${err.message || "Network error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="outline" onClick={() => router.push("/")} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>

        <Card className="p-8 border-2 border-emerald-100">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Sprout className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900">Farmer Login</h1>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {demoOtp && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-900">
                Demo OTP for testing: <strong>{demoOtp}</strong>
              </AlertDescription>
            </Alert>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg text-gray-700 font-medium flex items-center">
                    +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="flex-1"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Enter 10-digit mobile number</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">OTP sent to +91{phone.slice(-10)}</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("phone")
                  setOtp("")
                  setDemoOtp("")
                }}
                className="w-full"
              >
                Change Phone Number
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-gray-600 mt-6">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </p>
        </Card>
      </div>
    </div>
  )
}
