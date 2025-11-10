"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, MapPin, Leaf, Phone, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function FarmerProfile() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "", // Added phone field
    email: "", // Added email field
    village: "",
    district: "",
    state: "",
    landSize: "",
    primaryCrops: [] as string[],
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/farmer/profile?farmerId=${user?.id}`)
      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
        setFormData({
          name: data.data.name,
          phone: data.data.phone || "", // Added phone to form data
          email: data.data.email || "", // Added email to form data
          village: data.data.village,
          district: data.data.district,
          state: data.data.state,
          landSize: data.data.landSize.toString(),
          primaryCrops: data.data.primaryCrops,
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/farmer/profile/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId: user?.id,
          ...formData,
          landSize: Number.parseFloat(formData.landSize),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success!",
          description: "Profile updated successfully",
        })
        setEditing(false)
        fetchProfile()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Card className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile?.name}</h1>
                <p className="text-gray-600">{profile?.phone}</p>
                {profile?.verified && <Badge className="mt-2 bg-emerald-600">Verified Farmer</Badge>}
              </div>
            </div>
            <Button onClick={() => (editing ? handleSave() : setEditing(true))}>
              {editing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Full Name</Label>
              {editing ? (
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              ) : (
                <p className="p-2 text-gray-900">{profile?.name}</p>
              )}
            </div>

            <div>
              <Label>Phone Number</Label>
              {editing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              ) : (
                <p className="p-2 text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {profile?.phone}
                </p>
              )}
            </div>

            <div>
              <Label>Email (Optional)</Label>
              {editing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="farmer@example.com"
                />
              ) : (
                <p className="p-2 text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {profile?.email || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <Label>Village</Label>
              {editing ? (
                <Input
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                />
              ) : (
                <p className="p-2 text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {profile?.village}
                </p>
              )}
            </div>

            <div>
              <Label>District</Label>
              {editing ? (
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              ) : (
                <p className="p-2 text-gray-900">{profile?.district}</p>
              )}
            </div>

            <div>
              <Label>State</Label>
              {editing ? (
                <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
              ) : (
                <p className="p-2 text-gray-900">{profile?.state}</p>
              )}
            </div>

            <div>
              <Label>Land Size (acres)</Label>
              {editing ? (
                <Input
                  type="number"
                  value={formData.landSize}
                  onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                />
              ) : (
                <p className="p-2 text-gray-900 flex items-center gap-2">
                  <Leaf className="w-4 h-4" /> {profile?.landSize} acres
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Label>Primary Crops</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile?.primaryCrops.map((crop: string) => (
                <Badge key={crop} variant="outline" className="bg-emerald-50">
                  {crop}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Your profile is visible to all traders on the platform. Keep your information
              up-to-date to get better deals.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
