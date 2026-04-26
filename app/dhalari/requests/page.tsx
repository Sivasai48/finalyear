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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MapPin, Leaf, Phone, TrendingUp, Loader2, Package, Calendar, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CropRequest {
  id: string
  farmerName: string
  farmerPhone: string
  cropName: string
  quantity: number
  price: number
  status: string
  message: string
  createdAt: string
}

export default function DhalariCropRequests() {
  const router = useRouter()
  const { user, isLoading } = useAuthContext()
  const { t } = useLanguage()
  const { toast } = useToast()
  const [sentRequests, setSentRequests] = useState<CropRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      // @ts-ignore
      const userId = user?.id || user?.sub
      if (!userId) return

      try {
        const response = await fetch(`http://localhost:8000/api/trader-requests/dhalari/${userId}`)
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        // Filter only crop_deal requests (sent by dhalari to farmers)
        const cropDealRequests = data.filter((item: any) => item.request_type === 'crop_deal')
        const sent = cropDealRequests.map((item: any) => ({
          id: item.id,
          farmerName: item.farmer_name || "Farmer",
          farmerPhone: item.farmer_phone || "N/A",
          cropName: item.crop_name || "Unknown Crop",
          quantity: item.requested_quantity || 0,
          price: item.offered_price || 0,
          status: item.status,
          message: item.message || "",
          createdAt: item.created_at
        }))
        setSentRequests(sent)
      } catch (error) {
        console.error("Error fetching crop requests:", error)
        toast({
          title: "Error",
          description: "Failed to load your crop requests",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (!isLoading && user) {
      fetchRequests()
    }
  }, [user, isLoading, toast])

  // Show loading while auth context is hydrating
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user || user.type !== "dhalari") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 pt-6 text-center">
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-gray-600">Please sign in as a Dhalari to view crop requests.</p>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push("/dhalari/auth")}
            >
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderRequestCard = (req: CropRequest) => (
    <Card key={req.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{req.cropName}</h3>
              <p className="text-sm text-gray-500">Farmer: {req.farmerName}</p>
            </div>
            <Badge
              variant={req.status === "pending" ? "outline" : req.status === "accepted" ? "default" : "destructive"}
              className={req.status === "accepted" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {req.status}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Requested Quantity:</span>
              <span className="font-semibold text-gray-900">{req.quantity} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Offered Price:</span>
              <div className="flex items-center gap-1 font-semibold text-gray-900">
                <TrendingUp className="w-4 h-4 text-amber-600" />₹{req.price}/kg
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Value:</span>
              <span className="font-bold text-lg text-emerald-600">
                ₹{(req.quantity * req.price).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(req.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Message if any */}
          {req.message && (
            <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 italic">
              "{req.message}"
            </div>
          )}

          {/* Status info */}
          {req.status === "pending" && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-sm text-yellow-700">Waiting for farmer's response...</p>
            </div>
          )}
          {req.status === "accepted" && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-sm text-emerald-700 font-medium">Deal Accepted!</p>
              <p className="text-sm text-emerald-600">Farmer phone: {req.farmerPhone}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Crop Deal Requests</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell userId={user?.id || "dhalari-001"} userType="dhalari" />
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600 mb-6">Track the status of your crop purchase offers sent to farmers.</p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <Tabs defaultValue="sent" className="w-full">
            <TabsList className="grid w-full grid-cols-1 mb-6">
              <TabsTrigger value="sent" className="gap-2">
                <Send className="w-4 h-4" />
                Sent Offers ({sentRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sent">
              {sentRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't sent any crop deal requests yet.</p>
                  <Button
                    variant="link"
                    onClick={() => router.push("/dhalari/market")}
                    className="mt-2 text-emerald-600"
                  >
                    Browse Marketplace to find crops
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {sentRequests.map((req) => renderRequestCard(req))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
