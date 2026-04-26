"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Leaf, MapPin, Package, IndianRupee, Calendar, Edit, Trash2 } from "lucide-react"

interface Crop {
  id: string
  cropName: string
  quantity: number
  pricePerKg: number
  location: string
  status: string
  description?: string
  createdAt: string
  farmerPhone: string
}

export default function MyCropsPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const { toast } = useToast()
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null)
  const [editForm, setEditForm] = useState({
    cropName: "",
    quantity: "",
    pricePerKg: "",
    location: "",
    description: "",
  })

  useEffect(() => {
    if (!user || user.type !== "farmer") {
      router.push("/")
      return
    }
    fetchMyCrops()
  }, [user, router])

  const fetchMyCrops = async () => {
    try {
      // @ts-ignore
      const userId = user?.id || user?.sub
      const response = await fetch(`http://127.0.0.1:8000/api/crops/farmer/${userId}`)
      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      // Map backend fields to frontend interface
      const mappedCrops = data.map((crop: any) => ({
        id: crop.id,
        cropName: crop.name,
        quantity: crop.quantity,
        pricePerKg: crop.expected_price,
        location: crop.location,
        status: crop.status || "available",
        description: crop.description,
        createdAt: crop.created_at,
        farmerPhone: crop.farmer_phone
      }))
      setCrops(mappedCrops)
    } catch (error) {
      console.error("[v0] Error fetching crops:", error)
      toast({
        title: "Error",
        description: "Failed to load crops",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop)
    setEditForm({
      cropName: crop.cropName,
      quantity: crop.quantity.toString(),
      pricePerKg: crop.pricePerKg.toString(),
      location: crop.location,
      description: crop.description || "",
    })
  }

  const handleSaveEdit = async () => {
    if (!editingCrop) return

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`http://127.0.0.1:8000/api/crops/${editingCrop.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.cropName,
          quantity: parseFloat(editForm.quantity),
          expected_price: parseFloat(editForm.pricePerKg),
          location: editForm.location,
          description: editForm.description
        }),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Crop updated successfully",
        })
        setEditingCrop(null)
        fetchMyCrops()
      } else {
        throw new Error("Failed to update")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update crop",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (cropId: string) => {
    if (!confirm("Are you sure you want to delete this crop listing?")) return

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`http://127.0.0.1:8000/api/crops/${cropId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Crop deleted successfully",
        })
        fetchMyCrops()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete crop",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">My Crop Listings</h1>
          <p className="text-gray-600">Manage your active crop listings and track their status</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <Card key={crop.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  {crop.cropName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span>{crop.quantity} kg</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="w-4 h-4 text-gray-500" />
                  <span>₹{crop.pricePerKg}/kg</span>
                  <span className="text-gray-500">(Total: ₹{crop.quantity * crop.pricePerKg})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{crop.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{new Date(crop.createdAt).toLocaleDateString()}</span>
                </div>
                {crop.description && <p className="text-sm text-gray-600 line-clamp-2">{crop.description}</p>}
                <Badge variant={crop.status === "available" ? "default" : "secondary"}>
                  {crop.status === "available" ? "Available" : "Sold"}
                </Badge>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => handleEdit(crop)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete(crop.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {crops.length === 0 && (
          <div className="text-center py-12">
            <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">You haven't added any crop listings yet</p>
            <Button
              className="mt-4 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => router.push("/farmer/add-crop")}
            >
              Add Your First Crop
            </Button>
          </div>
        )}
      </main>

      <Dialog open={!!editingCrop} onOpenChange={() => setEditingCrop(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Crop Listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Crop Name</Label>
              <Input
                value={editForm.cropName}
                onChange={(e) => setEditForm({ ...editForm, cropName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity (kg)</Label>
                <Input
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                />
              </div>
              <div>
                <Label>Price per kg (₹)</Label>
                <Input
                  type="number"
                  value={editForm.pricePerKg}
                  onChange={(e) => setEditForm({ ...editForm, pricePerKg: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="flex-1 bg-emerald-600">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingCrop(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
