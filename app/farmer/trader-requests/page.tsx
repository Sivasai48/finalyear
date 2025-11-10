"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Phone, MapPin, Package, IndianRupee, Calendar } from "lucide-react"

interface TraderRequest {
  id: string
  dhalariName: string
  dhalariPhone: string
  dhalariLocation: string
  cropName: string
  requestedQuantity: number
  offeredPrice: number
  status: string
  requestDate: string
  message?: string
}

export default function TraderRequestsPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const [requests, setRequests] = useState<TraderRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.type !== "farmer") {
      router.push("/")
      return
    }
    fetchTraderRequests()
  }, [user, router])

  const fetchTraderRequests = async () => {
    try {
      const response = await fetch("/api/farmer/trader-requests")
      const data = await response.json()
      if (data.success) {
        setRequests(data.data)
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId: string) => {
    try {
      await fetch(`/api/farmer/trader-requests/${requestId}/accept`, { method: "POST" })
      fetchTraderRequests()
    } catch (error) {
      console.error("Error accepting request:", error)
    }
  }

  const handleDecline = async (requestId: string) => {
    try {
      await fetch(`/api/farmer/trader-requests/${requestId}/decline`, { method: "POST" })
      fetchTraderRequests()
    } catch (error) {
      console.error("Error declining request:", error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t("common.loading")}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.push("/farmer/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("farmer.traderRequests")}</h1>
          <p className="text-gray-600">{t("farmer.traderRequestsDescription")}</p>
        </div>

        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    {request.dhalariName}
                  </CardTitle>
                  <Badge
                    variant={
                      request.status === "pending" ? "default" : request.status === "accepted" ? "default" : "secondary"
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-emerald-600">{request.dhalariPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{request.dhalariLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(request.requestDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span>
                        {request.cropName} - {request.requestedQuantity} kg
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <IndianRupee className="w-4 h-4 text-gray-500" />
                      <span>₹{request.offeredPrice}/kg</span>
                      <span className="text-gray-500">
                        (Total: ₹{request.requestedQuantity * request.offeredPrice})
                      </span>
                    </div>
                  </div>
                </div>

                {request.message && (
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <p className="text-gray-700">
                      <strong>{t("common.message")}:</strong> {request.message}
                    </p>
                  </div>
                )}

                {request.status === "pending" && (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleAccept(request.id)}
                    >
                      {t("common.accept")}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleDecline(request.id)}
                    >
                      {t("common.decline")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {requests.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">{t("farmer.noTraderRequests")}</p>
          </div>
        )}
      </main>
    </div>
  )
}
