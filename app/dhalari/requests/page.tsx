"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { NotificationsBell } from "@/components/notifications-bell"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Leaf, Phone, TrendingUp, Loader2 } from "lucide-react"

interface CropListing {
  id: string
  farmerId: string
  farmerName: string
  farmerEmail: string
  farmerPhone: string
  cropName: string
  quantity: number
  pricePerKg: number
  location: string
  description: string
  status: string
  createdAt: string
}

export default function DhalariRequests() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const { toast } = useToast()
  const [cropListings, setCropListings] = useState<CropListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.type !== "dhalari") {
      router.push("/")
    }
  }, [user, router])

  useEffect(() => {
    const fetchCropListings = async () => {
      try {
        const response = await fetch("/api/crops/add")
        const data = await response.json()
        if (data.success) {
          setCropListings(data.data)
        }
      } catch (error) {
        console.error("[v0] Error fetching crop listings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCropListings()
    const interval = setInterval(fetchCropListings, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAccept = async (listing: CropListing) => {
    try {
      const response = await fetch("/api/dhalari/deals/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropId: listing.id,
          dhalariId: user?.id || "dhalari-001",
          dhalariName: user?.name || "Trader",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Deal Accepted!",
          description: `Successfully accepted ${listing.cropName} deal. You will earn ₹${data.data.earnings.toLocaleString()} commission.`,
        })
        const refreshResponse = await fetch("/api/crops/add")
        const refreshData = await refreshResponse.json()
        if (refreshData.success) {
          setCropListings(refreshData.data.filter((item: CropListing) => item.status === "available"))
        }
      } else {
        throw new Error(data.message || "Failed to accept deal")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept deal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDecline = async (listing: CropListing) => {
    try {
      const response = await fetch("/api/dhalari/deals/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropId: listing.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Request Declined",
          description: `Declined ${listing.cropName} request and removed from listings.`,
        })
        setCropListings((prev) => prev.filter((item) => item.id !== listing.id))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline request. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Farmer Crop Listings</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell userId={user?.id || "dhalari-001"} userType="dhalari" />
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600 mb-6">Browse available crops from farmers and connect directly</p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : cropListings.length === 0 ? (
          <div className="text-center py-12">
            <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No crop listings available yet.</p>
            <p className="text-sm text-gray-400 mt-2">Check back soon for new farmer listings!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {cropListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Farmer Info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{listing.farmerName}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm font-bold text-emerald-600">
                          <Phone className="w-4 h-4" />
                          {listing.farmerPhone}
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium">
                        {listing.status}
                      </div>
                    </div>

                    {/* Crop Details */}
                    <div className="space-y-2 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Crop:</span>
                        <div className="flex items-center gap-1 font-semibold text-gray-900">
                          <Leaf className="w-4 h-4 text-emerald-600" />
                          {listing.cropName}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <span className="font-semibold text-gray-900">{listing.quantity} Kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Price:</span>
                        <div className="flex items-center gap-1 font-semibold text-gray-900">
                          <TrendingUp className="w-4 h-4 text-amber-600" />₹{listing.pricePerKg}/Kg
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Value:</span>
                        <span className="font-bold text-lg text-emerald-600">
                          ₹{(listing.quantity * listing.pricePerKg).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Location:</span>
                        <div className="flex items-center gap-1 text-gray-900">
                          <MapPin className="w-4 h-4" />
                          {listing.location}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {listing.description && (
                      <div className="border-t pt-3">
                        <p className="text-sm text-gray-600">{listing.description}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleAccept(listing)}
                      >
                        Accept Deal
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                        onClick={() => handleDecline(listing)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
