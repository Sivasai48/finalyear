"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, X, Edit2, Leaf, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProfileHeader, ProfileStats, ContactInfo } from "@/components/ui/modern-profile"

export default function FarmerProfile() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    landSize: "",
    primaryCrops: [] as string[],
    about: "" // Added about field if supported, or mapped to something else
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      if (!token) throw new Error("No auth token found")

      const response = await fetch(`http://localhost:8000/api/farmers/${user?.id}`, { // Fetch by ID specifically to get stats
        headers: { "Authorization": `Bearer ${token}` }
      })

      // Fallback to /profile if ID fetch fails? Actually farmers.py has /api/farmers/{id}
      // But let's check if the previous code used /api/farmers/profile. 
      // The previous code used /api/farmers/profile which might get current user profile.
      // Let's stick to /api/farmers/{id} as it returns the full FarmerResponse with stats.

      if (!response.ok) {
        // Try alternative endpoint if needed
        throw new Error("Failed to fetch profile")
      }

      const data = await response.json()
      setProfile(data)
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        location: data.location || "",
        landSize: data.land_size ? data.land_size.toString() : "",
        primaryCrops: [],
        about: ""
      })
    } catch (error) {
      console.error("[v0] Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`http://localhost:8000/api/farmers/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email, // Added email update
          location: formData.location,
          land_size: parseFloat(formData.landSize) || 0,
        }),
      })

      if (!response.ok) throw new Error("Failed to update")

      const data = await response.json()
      setProfile(data)
      toast({ title: "Success!", description: "Profile updated successfully" })
      setEditing(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  )

  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently";

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2 hover:bg-white/50">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>

        {/* Profile Header */}
        <ProfileHeader
          name={profile?.name || "Farmer"}
          type="Farmer"
          location={profile?.location || "Location not set"}
          joinDate={joinDate}
          isVerified={true}
        />

        {/* Stats Section */}
        <ProfileStats
          successRate={profile?.success_rate || 0}
          totalDeals={profile?.total_deals || 0}
          activeListings={profile?.activeCrops || undefined}
        />

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Contact & Private Info */}
          <div className="md:col-span-1 space-y-6">
            <ContactInfo
              phone={profile?.phone}
              email={profile?.email}
              isConnected={true}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Farm Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Land Size</div>
                  <div className="font-medium flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    {profile?.land_size || 0} Acres
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Edit Form or Public View */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profile Details</CardTitle>
                <Button
                  variant={editing ? "ghost" : "outline"}
                  onClick={() => editing ? setEditing(false) : setEditing(true)}
                  className="gap-2"
                >
                  {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  {editing ? "Cancel" : "Edit Profile"}
                </Button>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Village, District"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="farmer@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Land Size (Acres)</Label>
                        <Input
                          type="number"
                          value={formData.landSize}
                          onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Land Size (Acres)</Label>
                        <Input
                          type="number"
                          value={formData.landSize}
                          onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>About (Bio)</Label>
                        <Textarea
                          placeholder="Tell traders about your farm and crops..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="prose max-w-none text-gray-600">
                      <p>
                        Welcome to my farmer profile. I specialize in sustainable farming practices
                        and high-quality crop production. Check out my listings in the marketplace!
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="font-medium">{profile?.location || "Not specified"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Member Since</div>
                        <div className="font-medium">{joinDate}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
