"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { TrendingUp, ArrowLeft } from "lucide-react"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"

export default function DhalariAuth() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuthContext()

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_token: credentialResponse.credential,
          user_type: "dhalari"
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Decode JWT to get user ID
        const payload = JSON.parse(atob(data.access_token.split('.')[1]))
        localStorage.setItem("auth-token", data.access_token)
        login({ id: payload.sub, name: "Dhalari User", type: "dhalari" })
        router.push("/dhalari/dashboard")
      } else {
        setError(data.detail || "Authentication failed")
      }
    } catch (err) {
      setError("Failed to verify Google token.")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/dhalari-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-oauth", email }),
      })

      const data = await response.json()

      if (data.success) {
        login(data.user)
        router.push("/dhalari/dashboard")
      } else {
        setError(data.error || "Authentication failed")
      }
    } catch (err) {
      setError("Failed to authenticate. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id"}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button variant="outline" onClick={() => router.push("/")} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>

          <Card className="p-8 border-2 border-blue-100">
            <div className="flex items-center justify-center gap-2 mb-8">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Trader Login</h1>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="your@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-white"
                />
                <p className="text-xs text-gray-500 mt-2">Use your business email</p>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? "Authenticating..." : "Continue with Email"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-4">
                For Production: Connect Google OAuth in the sidebar
              </p>
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google Login Failed")}
                  type="standard"
                  theme="outline"
                  width="100%"
                />
              </div>
            </div>

            <p className="text-center text-xs text-gray-600 mt-6">
              By logging in, you agree to our Terms of Service and Privacy Policy
            </p>
          </Card>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}
