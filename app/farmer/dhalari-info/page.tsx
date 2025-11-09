"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Phone, Star, Loader2 } from "lucide-react"

export default function DhalariInfoPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [dhalaris, setDhalaris] = useState([])
  const [filter, setFilter] = useState({ crop: "all", location: "all" })

  useEffect(() => {
    if (!user || user.type !== "farmer") {
      router.push("/")
      return
    }
    fetchDhalaris()
  }, [user])

  const fetchDhalaris = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/dhalari/list")
      const result = await response.json()
      setDhalaris(result.data || [])
    } catch (error) {
      console.error("Failed to fetch dhalaris:", error)
      setDhalaris([])
    } finally {
      setLoading(false)
    }
  }

  const filteredDhalaris = dhalaris.filter((d: any) => {
    if (
      filter.crop !== "all" &&
      !d.specialization?.some((s: string) => s.toLowerCase().includes(filter.crop.toLowerCase()))
    )
      return false
    if (filter.location !== "all" && !d.location.toLowerCase().includes(filter.location.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => router.push("/farmer/dashboard")} className="mb-6 gap-2 bg-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Verified Traders</h1>
          <p className="text-gray-600">Connect with trusted dhalaris (agricultural traders) in your area</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Filter by Crop</label>
                <select
                  value={filter.crop}
                  onChange={(e) => setFilter({ ...filter, crop: e.target.value })}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md"
                >
                  <option value="all">All Crops</option>
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice</option>
                  <option value="cotton">Cotton</option>
                  <option value="sugarcane">Sugarcane</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Filter by Location</label>
                <select
                  value={filter.location}
                  onChange={(e) => setFilter({ ...filter, location: e.target.value })}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md"
                >
                  <option value="all">All Locations</option>
                  <option value="punjab">Punjab</option>
                  <option value="haryana">Haryana</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="delhi">Delhi</option>
                  <option value="west bengal">West Bengal</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dhalari List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredDhalaris.map((dhalari: any) => (
              <Card key={dhalari.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{dhalari.name}</h3>
                          {dhalari.verified && <span className="text-xs text-emerald-600 font-medium">✓ Verified</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>
                          {dhalari.rating} ({dhalari.deals} deals)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{dhalari.location}</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Specializations:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {dhalari.specialization?.map((crop: string) => (
                            <span key={crop} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Experience:</span> {dhalari.experience} years
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Commission Rate</p>
                        <p className="text-lg font-bold text-blue-600">{dhalari.commission}%</p>
                      </div>
                      <Button
                        onClick={() => alert(`Contacting ${dhalari.name}...\nPhone: ${dhalari.phone}`)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredDhalaris.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  No traders found with selected filters. Try adjusting your search.
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
