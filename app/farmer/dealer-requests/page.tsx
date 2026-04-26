"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Package, MapPin, Calendar, IndianRupee, Phone, Inbox, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authFetch } from "@/lib/auth-utils"

interface CropRequest {
  id: string
  name: string
  phone: string
  status: string
  cropName: string
  quantity: number
  price: number
  message: string
  createdAt: string
  type: "sent" | "received"
}

export default function FarmerCropRequests() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()
  const [receivedRequests, setReceivedRequests] = useState<CropRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionType, setActionType] = useState<"accepted" | "declined" | null>(null)
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [user])

  const fetchRequests = async () => {
    try {
      // @ts-ignore
      const userId = user?.id || user?.sub
      if (!userId) {
        setLoading(false)
        return
      }

      const response = await authFetch(`http://localhost:8000/api/trader-requests/farmer/${userId}`)
      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      // Filter only crop_deal requests (received from dhalaris)
      const cropDealRequests = data.filter((item: any) => item.request_type === 'crop_deal')
      const received = cropDealRequests.map((item: any) => ({
        id: item.id,
        name: item.dhalari_name || "Unknown Dealer",
        phone: item.dhalari_phone || "N/A",
        status: item.status,
        cropName: item.crop_name || "Unknown Crop",
        quantity: item.requested_quantity || 0,
        price: item.offered_price || 0,
        message: item.message || "",
        createdAt: item.created_at,
        type: "received" as const
      }))
      setReceivedRequests(received)
    } catch (error: any) {
      console.error("Error fetching crop requests:", error)
      toast({
        title: "Error",
        description: "Failed to load crop requests",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const initiateAction = (requestId: string, type: "accepted" | "declined") => {
    setSelectedReqId(requestId)
    setActionType(type)
    setConfirmOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedReqId || !actionType) {
      setConfirmOpen(false)
      return
    }

    try {
      const response = await authFetch(`http://localhost:8000/api/trader-requests/${selectedReqId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: actionType }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Failed to update")
      }

      toast({
        title: actionType === "accepted" ? "Deal Accepted!" : "Deal Declined",
        description: `The dealer has been notified.`,
        variant: actionType === "accepted" ? "default" : "destructive"
      })
      fetchRequests()
    } catch (error: any) {
      console.error("Error updating crop request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update request",
        variant: "destructive",
      })
    } finally {
      setConfirmOpen(false)
      setSelectedReqId(null)
      setActionType(null)
    }
  }

  const renderRequestCard = (req: CropRequest) => (
    <Card key={req.id} className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{req.name}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Phone className="w-4 h-4" /> {req.phone}
          </p>
        </div>
        <Badge variant={req.status === "pending" ? "outline" : req.status === "accepted" ? "default" : "destructive"}>
          {req.status}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-600" />
          <span className="font-medium">{req.cropName}</span>
          <span className="text-gray-600">- {req.quantity} kg</span>
        </div>

        <div className="flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-amber-600" />
          <span className="font-medium">₹{req.price}/kg</span>
          <span className="text-sm text-gray-600">
            (Total: ₹{(req.price * req.quantity).toLocaleString()})
          </span>
        </div>

        {req.createdAt && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date(req.createdAt).toLocaleDateString()}</span>
          </div>
        )}

        {req.message && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{req.message}</p>
          </div>
        )}
      </div>

      {req.status === "pending" && (
        <div className="mt-4 flex gap-2">
          <Button onClick={() => initiateAction(req.id, "accepted")} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            Accept
          </Button>
          <Button variant="outline" onClick={() => initiateAction(req.id, "declined")} className="flex-1 bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200">
            Decline
          </Button>
        </div>
      )}
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <h1 className="text-3xl font-bold mb-2">Crop Deal Requests</h1>
        <p className="text-gray-600 mb-6">Manage crop purchase offers from dealers. Accept or decline offers for your crops.</p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-1 mb-6">
              <TabsTrigger value="received" className="gap-2">
                <Inbox className="w-4 h-4" />
                Received Offers ({receivedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received">
              {receivedRequests.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No crop deal requests received from dealers yet</p>
                  <p className="text-sm text-gray-500 mt-2">Add your crops in the marketplace to receive offers</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {receivedRequests.map((req) => renderRequestCard(req))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              setConfirmOpen(false)
              setSelectedReqId(null)
              setActionType(null)
            }}
          />
          <div className="relative z-10 bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-2">Confirm Action</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {actionType} this crop deal?
              {actionType === 'accepted'
                ? ' This will notify the dealer that you are ready to proceed with the sale.'
                : ' The dealer will be notified of your decision.'}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmOpen(false)
                  setSelectedReqId(null)
                  setActionType(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                className={actionType === 'accepted' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
              >
                Confirm {actionType === 'accepted' ? 'Accept' : 'Decline'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
