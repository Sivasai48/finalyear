"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, X, Edit2, Briefcase, MapPin, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProfileHeader, ProfileStats, ContactInfo } from "@/components/ui/modern-profile"
import { authFetch } from "@/lib/auth-utils"

export default function DhalariProfile() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()

  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    location: "",
    specializations: [] as string[],
  })
  const [newSpecialization, setNewSpecialization] = useState("")

  useEffect(() => {
    if (user && user.type === "dhalari") {
      fetchProfile()
    } else if (user && user.type !== "dhalari") {
      router.push("/")
    }
  }, [user, router])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const dhalariId = user?.id
      const token = localStorage.getItem("auth-token")

      const response = await fetch(`http://localhost:8000/api/dhalaris/${dhalariId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          businessName: data.business_name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          specializations: data.specialization || [],
        })
      }
    } catch (error) {
      console.error("Failed to fetch profile", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSpecialization = () => {
    if (newSpecialization && !formData.specializations.includes(newSpecialization)) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization]
      }))
      setNewSpecialization("")
    }
  }

  const handleRemoveSpecialization = (specToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== specToRemove)
    }))
  }

  const handleSaveChanges = async () => {
    if (!user) return
    try {
      const dhalariId = user.id

      const payload = {
        business_name: formData.businessName,
        phone: formData.phone,
        location: formData.location,
        specialization: formData.specializations
      }

      const response = await authFetch(`http://localhost:8000/api/dhalaris/${dhalariId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({ title: "Success!", description: "Profile updated successfully" })
        const updatedData = await response.json()
        setProfile(updatedData)
        setEditing(false)
      } else {
        const err = await response.json()
        toast({ title: "Error", description: err.detail || "Failed to save", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently";

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2 hover:bg-white/50">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>

        {/* Profile Header */}
        <ProfileHeader
          name={profile?.name || "Dhalari"}
          type="Dhalari"
          location={profile?.location || "Location not set"}
          joinDate={joinDate}
          isVerified={profile?.verified}
        />

        {/* Stats Section */}
        <ProfileStats
          successRate={profile?.success_rate || 0}
          totalDeals={profile?.total_deals || 0}
          rating={profile?.rating || 0}
        />

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Contact info */}
          <div className="md:col-span-1 space-y-6">
            <ContactInfo
              phone={profile?.phone}
              email={profile?.email}
              isConnected={true} // User viewing their own profile
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Company Name</div>
                  <div className="font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    {profile?.business_name || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Commission Rate</div>
                  <div className="font-medium">{profile?.commission || 5}%</div>
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
                        <Label>Business Name</Label>
                        <Input
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Specializations</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.specializations.map((spec) => (
                            <Badge key={spec} className="gap-1 pr-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                              {spec}
                              <button onClick={() => handleRemoveSpecialization(spec)} className="ml-1 hover:text-red-600">×</button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newSpecialization}
                            onChange={(e) => setNewSpecialization(e.target.value)}
                            placeholder="Add crop type (e.g. Cotton)"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSpecialization()}
                          />
                          <Button type="button" variant="outline" onClick={handleAddSpecialization}>Add</Button>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleSaveChanges} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Specializations & Crops</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile?.specialization && profile.specialization.length > 0 ? (
                          profile.specialization.map((spec: string) => (
                            <Badge key={spec} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {spec}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No specializations listed</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="font-medium flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {profile?.location || "Not specified"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Rating</div>
                        <div className="font-medium flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500" />
                          {profile?.rating?.toFixed(1) || "0.0"} / 5.0
                        </div>
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
