"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, User, MapPin, Leaf, Phone, Search, Package, IndianRupee } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProfileDialog } from "@/components/profile-dialog"
import { authFetch } from "@/lib/auth-utils"

export default function Marketplace() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const { toast } = useToast()
  const [crops, setCrops] = useState<any[]>([])
  const [filteredCrops, setFilteredCrops] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  const [selectedCrop, setSelectedCrop] = useState<any>(null)
  const [requestData, setRequestData] = useState({
    quantity: "",
    price: "",
    message: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [viewProfileUser, setViewProfileUser] = useState<any>(null)

  useEffect(() => {
    fetchCrops()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = crops.filter(
        (crop) =>
          crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crop.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (crop.location && crop.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredCrops(filtered)
    } else {
      setFilteredCrops(crops)
    }
  }, [searchTerm, crops])

  const fetchCrops = async () => {
    try {
      const response = await authFetch("http://localhost:8000/api/crops")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      const sorted = data.reverse()
      setCrops(sorted)
      setFilteredCrops(sorted)
    } catch (error) {
      console.error("[v0] Error fetching crops:", error)
      toast({
        title: "Error",
        description: "Failed to load marketplace data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequestClick = (crop: any) => {
    setSelectedCrop(crop)
    setRequestData({
      quantity: crop.quantity.toString(),
      price: crop.expected_price.toString(),
      message: ""
    })
  }

  const handleSubmitRequest = async () => {
    if (!selectedCrop || !user) return

    const dhalariId = user.id

    if (!dhalariId) {
      toast({ title: "Error", description: "User ID missing", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        crop_id: selectedCrop.id,
        farmer_id: selectedCrop.farmer_id,
        dhalari_id: dhalariId,
        request_type: "crop_deal",
        requested_quantity: parseFloat(requestData.quantity),
        offered_price: parseFloat(requestData.price),
        message: requestData.message
      }


      const response = await authFetch("http://localhost:8000/api/trader-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      })


      // authFetch handles 401 by redirecting to login
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || "Failed to send request")
      }

      toast({
        title: "Request Sent!",
        description: `Your request for ${selectedCrop.name} has been sent to ${selectedCrop.farmer_name}.`,
      })
      setSelectedCrop(null)
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Error",
        description: error.message || "Failed to send request",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> {t("market.back")}
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t("market.cropMarketplace")}</h1>
          <p className="text-gray-600">{t("market.browseDescription")}</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={t("market.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <p>{t("market.loadingData")}</p>
        ) : filteredCrops.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">{t("market.noCrops")}</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((crop) => (
              <Card key={crop.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col border-t-4 border-t-emerald-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-emerald-800">{crop.name}</h3>
                    <p
                      className="text-sm text-gray-500 font-medium cursor-pointer hover:underline hover:text-blue-600 flex items-center gap-1"
                      onClick={() => setViewProfileUser({
                        name: crop.farmer_name,
                        phone: crop.farmer_phone,
                        location: crop.location,
                        land_size: "N/A",
                        is_connected: crop.is_connected
                      })}
                    >
                      by {crop.farmer_name}
                      {crop.is_connected && <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">{t("market.connected")}</Badge>}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 capitalize">{crop.season || "Season"}</Badge>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold">{crop.quantity} kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-amber-600" />
                      <span className="font-semibold">₹{crop.expected_price}/kg</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {crop.location || t("market.locationNotSpecified")}
                  </div>

                  {crop.description && (
                    <p className="text-sm text-gray-600 italic line-clamp-2">"{crop.description}"</p>
                  )}

                  <div className={`flex items-center gap-2 text-sm ${!crop.is_connected ? 'text-gray-400 italic' : 'text-gray-600'}`}>
                    <Phone className="w-4 h-4" />
                    {crop.farmer_phone && !crop.farmer_phone.includes('*') ? crop.farmer_phone : t("market.hiddenConnect")}
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleRequestClick(crop)}>
                  {t("market.requestDeal")}
                </Button>
              </Card>
            ))}
          </div>
        )}

        <ProfileDialog
          open={!!viewProfileUser}
          onOpenChange={(open) => !open && setViewProfileUser(null)}
          user={viewProfileUser}
          type="farmer"
        />
      </div>

      <Dialog open={!!selectedCrop} onOpenChange={(open) => !open && setSelectedCrop(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("market.makeOffer")} {selectedCrop?.name}</DialogTitle>
            <DialogDescription>
              {t("market.sendPurchase")} {selectedCrop?.farmer_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("market.quantity")}</Label>
                <Input
                  type="number"
                  value={requestData.quantity}
                  onChange={(e) => setRequestData({ ...requestData, quantity: e.target.value })}
                />
                <p className="text-xs text-gray-500">{t("market.available")} {selectedCrop?.quantity} kg</p>
              </div>
              <div className="space-y-2">
                <Label>{t("market.offerPrice")}</Label>
                <Input
                  type="number"
                  value={requestData.price}
                  onChange={(e) => setRequestData({ ...requestData, price: e.target.value })}
                />
                <p className="text-xs text-gray-500">{t("market.expected")} ₹{selectedCrop?.expected_price}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("market.messageOptional")}</Label>
              <Textarea
                placeholder={t("market.messagePlaceholder")}
                value={requestData.message}
                onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCrop(null)} disabled={submitting}>{t("common.cancel")}</Button>
            <Button onClick={handleSubmitRequest} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting ? t("market.sending") : t("market.sendRequest")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
