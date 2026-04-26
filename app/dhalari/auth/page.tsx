"use client"

import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuthContext } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Briefcase } from "lucide-react"

// Replace with your actual Google Client ID from .env.local
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id"

export default function DhalariAuthPage() {
    const router = useRouter()
    const { user, login } = useAuthContext()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    // Navigate to dashboard only AFTER user state is updated
    useEffect(() => {
        if (user && user.type === "dhalari") {
            router.replace("/dhalari/dashboard")
        }
    }, [user, router])

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            toast({ title: "Error", description: "No credential received from Google", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            const response = await fetch("http://localhost:8000/api/auth/google-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_token: credentialResponse.credential,
                    user_type: "dhalari"
                }),
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.detail || "Authentication failed")
            }

            const data = await response.json()

            // Decode JWT to get user info (basic decode, not verification)
            const payload = JSON.parse(atob(data.access_token.split('.')[1]))

            // Store token
            localStorage.setItem("auth-token", data.access_token)

            // Login to context - navigation will happen via useEffect above
            login({
                id: payload.sub,
                name: "Dhalari User",
                email: "",
                type: "dhalari",
            })

            toast({ title: "Success", description: "Logged in successfully!" })
            // DON'T navigate here - let the useEffect handle it after state updates

        } catch (error: any) {
            console.error("Google auth error:", error)
            toast({
                title: "Authentication Failed",
                description: error.message || "Could not authenticate with Google",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleError = () => {
        toast({
            title: "Google Sign-In Failed",
            description: "Could not connect to Google. Please try again.",
            variant: "destructive"
        })
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="w-8 h-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl">Dhalari Portal</CardTitle>
                        <CardDescription>Sign in to access your trader dashboard</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            {loading ? (
                                <p className="text-gray-500">Authenticating...</p>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600 text-center">
                                        Sign in with your Google account to continue. New users will be automatically registered.
                                    </p>
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleError}
                                        theme="outline"
                                        size="large"
                                        text="signin_with"
                                        shape="rectangular"
                                        width="300"
                                    />
                                </>
                            )}
                        </div>

                        <div className="text-center text-sm text-gray-500">
                            <p>By signing in, you agree to our Terms of Service</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </GoogleOAuthProvider>
    )
}
