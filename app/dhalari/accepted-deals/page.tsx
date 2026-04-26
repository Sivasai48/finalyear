"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Leaf, Package } from "lucide-react"

interface Deal {
  id: string
  cropName: string
  farmerName: string
  farmerPhone: string
  quantity: number
  pricePerKg: number
  totalValue: number
  earnings: number
  createdAt: string
  status: string
}

export default function AcceptedDeals() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.type !== "dhalari") {
      router.push("/")
      return
    }

    fetchDeals()
  }, [user, router])

  const fetchDeals = async () => {
    try {
      // @ts-ignore
      const dhalariId = user?.id || user?.sub
      if (!dhalariId) {
        setLoading(false)
        return
      }


      // Fetch from actual backend API
      const response = await fetch(`http://127.0.0.1:8000/api/trader-requests/dhalari/${dhalariId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch deals")
      }

      const data = await response.json()

      // Filter for accepted deals only and map to our interface
      const acceptedDeals = data
        .filter((req: any) => req.status === "accepted")
        .map((req: any) => ({
          id: req.id,
          cropName: req.crop_name || "Unknown Crop",
          farmerName: req.farmer_name || "Farmer",
          farmerPhone: req.farmer_phone || "N/A",
          quantity: req.requested_quantity || 0,
          pricePerKg: req.offered_price || 0,
          totalValue: (req.requested_quantity || 0) * (req.offered_price || 0),
          earnings: ((req.requested_quantity || 0) * (req.offered_price || 0)) * 0.1, // 10% commission
          createdAt: req.created_at,
          status: req.status
        }))

      setDeals(acceptedDeals)
    } catch (error) {
      console.error("[v0] Error fetching deals:", error)
    } finally {
      setLoading(false)
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
            <h1 className="text-2xl font-bold">{t("dhalari.acceptedDeals")}</h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600 mb-6 font-medium">View all your completed deals and total spending</p>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No accepted deals yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow border-blue-50">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">{deal.cropName}</h3>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">Accepted</span>
                    </div>

                    <div className="text-sm text-gray-600 border-b pb-2">
                      <p><strong>Farmer:</strong> {deal.farmerName}</p>
                      <p><strong>Phone:</strong> {deal.farmerPhone}</p>
                    </div>

                    <div className="space-y-2 text-sm italic">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-semibold">{deal.quantity} Kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price/Kg:</span>
                        <span className="font-semibold text-blue-600">₹{deal.pricePerKg}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600 font-bold">Total Amount Spent:</span>
                        <span className="font-bold text-blue-800">₹{deal.totalValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-xs">
                          {new Date(deal.createdAt).toLocaleDateString()}
                        </span>
                      </div>
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
