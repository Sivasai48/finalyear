"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, MapPin, Phone, Search, Sprout, UserPlus, Clock, Check, MessageCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuthContext } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useConnections } from "@/hooks/use-connections"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { ProfileDialog } from "@/components/profile-dialog"
import { authFetch } from "@/lib/auth-utils"

export default function FindFarmersPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()
  // @ts-ignore
  const userId = user?.id || user?.sub
  const { sendRequest, cancelRequest, getRequestStatus } = useConnections(userId, "dhalari")

  const [farmers, setFarmers] = useState<any[]>([])
  const [filteredFarmers, setFilteredFarmers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  // Contact Modal State
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null)
  const [viewProfile, setViewProfile] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [sending, setSending] = useState(false)

  // Force re-render on connection state changes
  const [, setTick] = useState(0)

  useEffect(() => {
    fetchFarmers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = farmers.filter(
        (farmer) =>
          farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          farmer.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredFarmers(filtered)
    } else {
      setFilteredFarmers(farmers)
    }
  }, [searchTerm, farmers])

  // Listen for sync events to re-render buttons
  useEffect(() => {
    const handler = () => setTick(t => t + 1)
    window.addEventListener("agricon_sync", handler)
    return () => window.removeEventListener("agricon_sync", handler)
  }, [])

  const fetchFarmers = async () => {
    try {
      const response = await authFetch("http://127.0.0.1:8000/api/farmers")
      if (!response.ok) throw new Error("Failed to fetch farmers")
      const data = await response.json()
      setFarmers(data)
      setFilteredFarmers(data)
    } catch (error) {
      console.error("Error fetching farmers:", error)
      toast({
        title: "Error",
        description: "Failed to load farmers list",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequestToggle = (farmer: any) => {
    if (!userId) return
    const { status, requestId } = getRequestStatus(userId, farmer.id)

    if (status === "none" || status === "received") {
      // Open dialog to send request
      setSelectedFarmer(farmer)
      setContactMessage("")
    } else if (status === "sent" && requestId) {
      // Cancel the request
      cancelRequest(requestId)
      toast({
        title: "Request Cancelled",
        description: `Connection request to ${farmer.name} has been cancelled.`,
      })
    } else if (status === "connected") {
      // Go to connections/chat
      router.push("/dhalari/connections")
    }
  }

  const handleSendRequest = async () => {
    if (!selectedFarmer || !user || !userId) return

    setSending(true)
    try {
      // Save to localStorage via hook
      sendRequest(
        { id: userId, type: "dhalari", name: user.email || "Dealer", phone: "" },
        { id: selectedFarmer.id, type: "farmer", name: selectedFarmer.name, phone: selectedFarmer.phone },
        contactMessage
      )

      // Also send via API for backend tracking (best-effort)
      try {
        await authFetch("http://127.0.0.1:8000/api/trader-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dhalari_id: userId,
            farmer_id: selectedFarmer.id,
            request_type: "contact",
            message: contactMessage,
          })
        })
      } catch {
        // API is best-effort
      }

      toast({
        title: "Request Sent!",
        description: `Connection request sent to ${selectedFarmer.name}`,
      })
      setSelectedFarmer(null)
    } catch (error: any) {
      console.error("Contact request error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send contact request",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  const getButtonProps = (farmer: any) => {
    if (!userId) return { label: "Request", icon: UserPlus, className: "bg-emerald-600 hover:bg-emerald-700 text-white", disabled: true }
    const { status } = getRequestStatus(userId, farmer.id)

    switch (status) {
      case "sent":
        return {
          label: "Requested",
          icon: Clock,
          className: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300",
          disabled: false,
        }
      case "connected":
        return {
          label: "Connected ✓",
          icon: MessageCircle,
          className: "bg-blue-600 hover:bg-blue-700 text-white",
          disabled: false,
        }
      case "received":
        return {
          label: "Accept Request",
          icon: Check,
          className: "bg-amber-500 hover:bg-amber-600 text-white",
          disabled: false,
        }
      default:
        return {
          label: "Request",
          icon: UserPlus,
          className: "bg-emerald-600 hover:bg-emerald-700 text-white",
          disabled: false,
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Find Farmers</h1>
          <p className="text-gray-600">Browse registered farmers and connect directly.</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <p>Loading farmers...</p>
        ) : filteredFarmers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No farmers found</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarmers.map((farmer) => {
              const btnProps = getButtonProps(farmer)
              const IconComp = btnProps.icon
              const connStatus = userId ? getRequestStatus(userId, farmer.id).status : "none"
              return (
                <Card key={farmer.id} className="p-6 hover:shadow-lg transition-shadow border-t-4 border-t-emerald-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-200"
                      onClick={() => { setSelectedFarmer(farmer); setViewProfile(true); }}
                    >
                      <User className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-lg cursor-pointer hover:underline"
                        onClick={() => { setSelectedFarmer(farmer); setViewProfile(true); }}
                      >
                        {farmer.name}
                      </h3>
                      <Badge className="mt-1 bg-emerald-600 text-xs">Farmer</Badge>
                      {connStatus === "connected" && <Badge variant="outline" className="ml-2 text-xs border-blue-500 text-blue-600">Connected</Badge>}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {farmer.location || "Location hidden"}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium flex items-center gap-2 ${connStatus !== 'connected' ? 'text-gray-400' : 'text-gray-700'}`}>
                        <Phone className="w-4 h-4" />
                        {connStatus === 'connected' ? farmer.phone : "Hidden (Connect first)"}
                      </p>
                      {connStatus !== 'connected' && <span className="text-xs text-amber-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Private</span>}
                    </div>

                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-emerald-500" />
                      Land: {farmer.land_size} acres
                    </p>

                    {farmer.success_rate !== undefined && (
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-2 pt-2 border-t">
                        <span className="font-semibold">{farmer.success_rate}% Success Rate</span>
                        <span>•</span>
                        <span>{farmer.total_deals} Deals</span>
                      </div>
                    )}
                  </div>

                  <Button
                    className={`w-full ${btnProps.className}`}
                    size="sm"
                    onClick={() => handleRequestToggle(farmer)}
                    disabled={btnProps.disabled}
                  >
                    <IconComp className="w-4 h-4 mr-2" />
                    {btnProps.label}
                  </Button>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <ProfileDialog
        open={viewProfile}
        onOpenChange={setViewProfile}
        user={selectedFarmer}
        type="farmer"
      />

      <Dialog open={!!selectedFarmer && !viewProfile} onOpenChange={(open) => !open && setSelectedFarmer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect with {selectedFarmer?.name}</DialogTitle>
            <DialogDescription>
              Send a message to initiate a conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Hi, I'm interested in your crops..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFarmer(null)} disabled={sending}>Cancel</Button>
            <Button onClick={handleSendRequest} disabled={sending} className="bg-emerald-600 hover:bg-emerald-700">
              {sending ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
