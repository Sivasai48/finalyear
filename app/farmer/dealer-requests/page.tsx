"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, MapPin, Calendar, IndianRupee, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DealerRequests() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/dhalari/requests/all")
      const data = await response.json()
      if (data.success) {
        setRequests(data.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId: string) => {
    try {
      const response = await fetch(`/api/farmer/accept-dealer-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, farmerId: user?.id }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Request Accepted!",
          description: "Dealer has been notified about your acceptance",
        })
        fetchRequests()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Dealer Crop Requests</h1>

        {loading ? (
          <p>Loading...</p>
        ) : requests.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No dealer requests available at the moment</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <Card key={req.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{req.dhalariName}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="w-4 h-4" /> {req.dhalariPhone}
                    </p>
                  </div>
                  <Badge variant={req.status === "pending" ? "outline" : "default"}>{req.status}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">{req.cropRequired}</span>
                    <span className="text-gray-600">- {req.quantityRequired} kg</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">₹{req.priceOffered}/kg</span>
                    <span className="text-sm text-gray-600">
                      (Total: ₹{(req.priceOffered * req.quantityRequired).toLocaleString()})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>{req.location}</span>
                  </div>

                  {req.deliveryDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <span>{new Date(req.deliveryDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {req.additionalNotes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{req.additionalNotes}</p>
                    </div>
                  )}
                </div>

                {req.status === "pending" && (
                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => handleAccept(req.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      Accept Deal
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Contact Dealer
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
