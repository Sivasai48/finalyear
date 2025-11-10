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
  cropType: string
  quantity: number
  pricePerKg: number
  totalValue: number
  earnings: number
  month: string
  year: number
  createdAt: string
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
      const response = await fetch(`/api/dhalari/deals?dhalariId=${user?.id || "dhalari-001"}`)
      const data = await response.json()
      if (data.success) {
        setDeals(data.data)
      }
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
            <h1 className="text-2xl font-bold">Accepted Deals</h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600 mb-6">View all your completed deals and earnings</p>

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
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-semibold text-lg">{deal.cropType}</h3>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs">Completed</span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-semibold">{deal.quantity} Kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price/Kg:</span>
                        <span className="font-semibold">₹{deal.pricePerKg}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="font-semibold">₹{deal.totalValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Your Earnings:</span>
                        <span className="font-bold text-emerald-600">₹{deal.earnings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-xs">
                          {deal.month} {deal.year}
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
