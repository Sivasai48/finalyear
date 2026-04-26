"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Phone, MapPin, Package, IndianRupee, Calendar } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [actionType, setActionType] = useState<"accept" | "decline" | null>(null)
  const [processing, setProcessing] = useState(false)
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
      // @ts-ignore - User type definition might be incomplete
      const userId = user?.id || user?.sub
      if (!userId) {
        setLoading(false)
        return
      }

      const response = await fetch(`http://localhost:8000/api/trader-requests/farmer/${userId}`)
      // Note: Backend returns list directly, not {success, data} wrapper based on schemas seen
      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      // Mapping backend snake_case to frontend camelCase if needed, or using as is if matched.
      // Backend returns TraderRequestWithDetails with snake_case fields (e.g. dhalari_name).
      // Frontend interface expects camelCase (dhalariName).
      // Need to map.
      const mappedData = data.map((item: any) => ({
        id: item.id,
        dhalariName: item.dhalari_name,
        dhalariPhone: item.dhalari_phone,
        dhalariLocation: "Unknown", // Backend doesn't send location in current schema
        cropName: item.crop_name,
        requestedQuantity: item.requested_quantity,
        offeredPrice: item.offered_price,
        status: item.status,
        requestDate: item.created_at,
        message: item.message
      }))
      setRequests(mappedData)
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmAction = (id: string, type: "accept" | "decline") => {
    setSelectedRequest(id)
    setActionType(type)
  }

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return

    setProcessing(true)
    try {
      const token = localStorage.getItem("auth-token")
      const status = actionType === "accept" ? "accepted" : "declined"
      const response = await fetch(`http://localhost:8000/api/trader-requests/${selectedRequest}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error("Failed into update")

      toast({
        title: "Success",
        description: `Request ${actionType}ed successfully`
      })

      fetchTraderRequests()
    } catch (error) {
      console.error("Error updating request:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
      setSelectedRequest(null)
      setActionType(null)
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
                      onClick={() => confirmAction(request.id, "accept")}
                    >
                      {t("common.accept")}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => confirmAction(request.id, "decline")}
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

      <AlertDialog open={!!selectedRequest} onOpenChange={(open: boolean) => !open && setSelectedRequest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "accept"
                ? "You are about to accept this deal. This action cannot be undone."
                : "You are about to decline this request."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => { e.preventDefault(); handleAction(); }}
              disabled={processing}
              className={actionType === "accept" ? "bg-emerald-600" : "bg-red-600"}
            >
              {processing ? "Processing..." : actionType === "accept" ? "Confirm Accept" : "Confirm Decline"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
